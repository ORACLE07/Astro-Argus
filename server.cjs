const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const root = __dirname;
const staticRoot = process.env.NODE_ENV === 'production' ? path.join(root, 'dist') : root;
const port = process.env.PORT || 5173;
const nseBase = 'https://www.nseindia.com';
const endpointAliases = new Map([
  ['NIFTY FINANCIAL SERVICES', 'NIFTY FIN SERVICE'], ['NIFTY FINANCIAL SERVICES 25/50', 'NIFTY FIN SERVICE 25/50'],
  ['NIFTY PRIVATE BANK', 'NIFTY PVT BANK'], ['NIFTY HEALTHCARE INDEX', 'NIFTY HEALTHCARE'],
  ['NIFTY CONSUMER DURABLES', 'NIFTY CONSR DURBL'], ['NIFTY OIL & GAS', 'NIFTY OIL AND GAS'],
]);
const displayNames = new Map([['NIFTY FINANCIAL SERVICES', 'Financial Services'], ['NIFTY FIN SERVICE', 'Financial Services'], ['NIFTY HEALTHCARE INDEX', 'Healthcare']]);
const sectorName = index => displayNames.get(index) || index.replace(/^NIFTY /, '').replace(/ INDEX$/, '').replaceAll(' & ', ' & ').replaceAll('  ', ' ');
const sectorEndpoint = index => endpointAliases.get(index) || index;

let cache = { at: 0, value: null };
let session = { cookie: '', at: 0 };

async function nse(pathname) {
  if (Date.now() - session.at > 10 * 60 * 1000) {
    const landing = await fetch(`${nseBase}/market-data/live-market-indices`, {
      headers: { 'user-agent': 'Mozilla/5.0', accept: 'text/html' },
    });
    session.cookie = landing.headers.get('set-cookie') || '';
    session.at = Date.now();
  }
  const response = await fetch(`${nseBase}${pathname}`, {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      accept: 'application/json,text/plain,*/*',
      referer: `${nseBase}/market-data/live-market-indices`,
      cookie: session.cookie,
    },
  });
  if (!response.ok) throw new Error(`NSE ${response.status} for ${pathname}`);
  return response.json();
}

const num = value => Number(String(value ?? 0).replaceAll(',', '')) || 0;
function normalizeStock(item, sector, futuresMap = new Map(), optionsMap = new Map()) {
  const futures = futuresMap.get(item.symbol) || {};
  const options = optionsMap.get(item.symbol) || [];
  return {
    symbol: item.symbol,
    name: item.meta?.companyName || item.symbol,
    sector,
    price: num(item.lastPrice || item.ltP || item.close),
    change: num(item.pChange || item.perChange),
    volume: num(item.totalTradedVolume || item.tradeInfo?.totalTradedVolume),
    futuresOi: futures.latestOI == null ? null : num(futures.latestOI),
    futuresOiChange: futures.changeInOI == null ? null : num(futures.changeInOI),
    futuresOiPercent: futures.prevOI ? Number(((num(futures.latestOI) / num(futures.prevOI) - 1) * 100).toFixed(2)) : null,
    optionSpurts: options.map(option => ({ strikePrice: num(option.strikePrice), optionType: option.optionType || '', expiryDate: option.expiryDate || '', oi: option.openInterest == null ? null : num(option.openInterest), oiChange: option.oiChange == null ? null : num(option.oiChange), oiPercent: option.oiPercent == null ? null : num(option.oiPercent), volume: num(option.volume), priceChange: num(option.pChange), build: option.oiPercent == null ? 'OI change unavailable' : option.oiPercent >= 0 && option.pChange >= 0 ? 'Long build' : option.oiPercent >= 0 ? 'Short build' : option.pChange >= 0 ? 'Short covering' : 'Long unwinding' })),
    marketCap: num(item.ffmc),
    pe: item.pe == null || item.pe === '' ? null : num(item.pe),
  };
}

const constituentPages = new Map([
  ['AUTO', 'nifty-auto'],
  ['FINANCIAL SERVICES 25/50', 'nifty-financial-services-25-50-index'],
  ['MIDSMALL HEALTHCARE', 'nifty-midsmallhealthcare'],
  ['FINANCIAL SERVICES EX-BANK', 'nifty-financial--services-ex-bank'],
  ['MIDSMALL FINANCIAL SERVICES', 'nifty-midsmall-financial-services'],
  ['MIDSMALL IT & TELECOM', 'nifty-midsmall-it-telecom'],
  ['NIFTY500 HEALTHCARE', 'nifty500-healthcare'],
  ['REITS & REALTY', 'nifty-reits---realty'],
]);
const officialConstituentCounts = new Map([['AUTO', 15], ['MIDSMALL IT & TELECOM', 20]]);

async function getConstituentFallback(sector) {
  const slug = constituentPages.get(sector);
  if (!slug) return [];
  try {
    const page = await fetch(`https://www.niftyindices.com/indices/equity/sectoral-indices/${slug}`, { headers: { 'user-agent': 'Mozilla/5.0' } }).then(r => r.text());
    const csvUrl = page.match(/https:\/\/www\.niftyindices\.com\/+IndexConstituent\/[^"']+\.csv/)?.[0];
    if (!csvUrl) return [];
    const csv = await fetch(csvUrl, { headers: { 'user-agent': 'Mozilla/5.0' } }).then(r => r.text());
    const symbols = csv.split(/\r?\n/).slice(1).map(line => { const fields = line.split(','); return { symbol: fields[2]?.trim(), name: fields[0]?.trim() }; }).filter(row => row.symbol);
    const output = [];
    for (let i = 0; i < symbols.length; i += 4) {
      const batch = await Promise.all(symbols.slice(i, i + 4).map(async item => {
        try {
          const payload = await nse(`/api/historicalOR/generateSecurityWiseHistoricalData?symbol=${encodeURIComponent(item.symbol)}&from=${formatNseDate(new Date(Date.now() - 7 * 86400000))}&to=${formatNseDate(new Date())}&series=ALL&type=priceVolumeDeliverable`);
          const latest = payload.data?.[0];
          let price = num(latest?.CH_LAST_TRADED_PRICE || latest?.CH_CLOSING_PRICE);
          let previous = num(latest?.CH_PREVIOUS_CLS_PRICE);
          let volume = num(latest?.CH_TOT_TRADED_QTY);
          if (!price) {
            try {
              const quote = await nse(`/api/quote-equity?symbol=${encodeURIComponent(item.symbol)}`);
              const priceInfo = quote.priceInfo || {};
              price = num(priceInfo.lastPrice);
              previous = num(priceInfo.previousClose);
            } catch {}
          }
          return { symbol: item.symbol, name: item.name || item.symbol, sector, price, change: previous ? Number(((price / previous - 1) * 100).toFixed(2)) : 0, volume, marketCap: 0, pe: 0 };
        } catch { return null; }
      }));
      output.push(...batch.filter(Boolean));
    }
    return output;
  } catch { return []; }
}

function formatNseDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

async function getRollingReturns(sectorIndices) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 45);
  const historyIndexes = sectorIndices.map(([name, index, original]) => [name, original || index]);
  const rows = [];
  for (const [name, index] of historyIndexes) {
    try {
      const payload = await nse(`/api/historicalOR/indicesHistory?indexType=${encodeURIComponent(index)}&from=${formatNseDate(from)}&to=${formatNseDate(to)}`);
      const closes = (payload.data || []).map(row => num(row.EOD_CLOSE_INDEX_VAL)).filter(Boolean);
      const latest = closes[0];
      const ret = days => latest && closes[days] ? Number(((latest / closes[days] - 1) * 100).toFixed(2)) : null;
      rows.push({ name, return7d: latest ? ret(5) : null, return14d: latest ? ret(10) : null, return28d: latest ? ret(20) : null, historyAvailable: Boolean(latest), method: 'index-close' });
    } catch {
      rows.push({ name, return7d: null, return14d: null, return28d: null, historyAvailable: false });
    }
  }
  return rows;
}

async function getMarket() {
  if (cache.value && Date.now() - cache.at < 60_000) return cache.value;
  const indices = await nse('/api/allIndices');
  const indexMap = new Map((indices.data || []).map(i => [i.index, i]));
  const stocks = [];
  const sectors = [];
  let futuresMap = new Map();
  let oiMap = new Map();
  let optionsMap = new Map();
  try {
    const oiPayload = await nse('/api/live-analysis-oi-spurts-underlyings');
    futuresMap = new Map((oiPayload.data || []).map(row => [row.symbol, row]));
  } catch {}
  try {
    const optionPayload = await nse('/api/live-analysis-oi-spurts-contracts');
    const optionRows = Object.values(optionPayload.data || {}).flat().filter(row => row.symbol && (row.instrumentType === 'OPTSTK' || String(row.instrument || '').toLowerCase().includes('stock option')));
    for (const row of optionRows) {
      if (row.identifier) oiMap.set(row.identifier, row);
      if (row.symbol && !oiMap.has(row.symbol)) oiMap.set(row.symbol, row);
    }
  } catch {}
  try {
    const activePayloads = await Promise.all([
      nse('/api/snapshot-derivatives-equity?index=calls-stocks-vol&type=volume'),
      nse('/api/snapshot-derivatives-equity?index=puts-stocks-vol&type=volume'),
    ]);
    for (const payload of activePayloads) for (const row of payload.OPTSTK?.data || []) {
      const options = optionsMap.get(row.underlying) || [];
      const oiSpurt = oiMap.get(row.identifier) || oiMap.get(row.underlying) || {};
      options.push({ ...row, volume: row.numberOfContractsTraded, oiChange: oiSpurt.changeInOI, oiPercent: oiSpurt.pChangeInOI });
      optionsMap.set(row.underlying, options);
    }
  } catch {}
  const namesFromNse = [...new Set([...indices.data.filter(i => i.key === 'SECTORAL INDICES').map(i => i.index), 'NIFTY BANK', 'NIFTY FINANCIAL SERVICES'])];
  const sectorIndices = namesFromNse.map(original => [sectorName(original), sectorEndpoint(original), original]);
  for (const [name, index, original] of sectorIndices) {
    const summary = indexMap.get(original) || indexMap.get(index);
    try {
      let snapshot = null;
      const snapshotIndex = index === 'NIFTY FIN SERVICE 25/50' ? 'NIFTY FINANCIAL SERVICES 25/50' : index;
      try { snapshot = await nse(`/api/equity-stockIndex?index=${encodeURIComponent(snapshotIndex)}`); } catch {}
      const meta = snapshot?.metadata || {};
      const market = { advances: num(snapshot?.advance?.advances), declines: num(snapshot?.advance?.declines), unchanged: num(snapshot?.advance?.unchanged), open: num(meta.open), previousClose: num(meta.previousClose), last: num(meta.last), gapOpen: meta.open && meta.previousClose ? Number(((meta.open / meta.previousClose - 1) * 100).toFixed(2)) : null, fromOpen: meta.open && meta.last ? Number(((meta.last / meta.open - 1) * 100).toFixed(2)) : null };
      const payload = await nse(`/api/equity-stock-indices?index=${encodeURIComponent(index)}`);
      let rows = (payload.data || []).filter(row => row.symbol && row.symbol !== index && !row.symbol.startsWith('NIFTY '));
      if (!rows.length || (officialConstituentCounts.has(name) && rows.length < officialConstituentCounts.get(name))) {
        const fallbackStocks = await getConstituentFallback(name);
        if (fallbackStocks.length > rows.length) {
          rows = fallbackStocks;
          stocks.push(...fallbackStocks.map(stock => ({ ...stock, ...normalizeStock({ symbol: stock.symbol, meta: { companyName: stock.name }, lastPrice: stock.price, pChange: stock.change, totalTradedVolume: stock.volume }, name, futuresMap, optionsMap) })));
        } else stocks.push(...rows.map(row => normalizeStock(row, name, futuresMap, optionsMap)));
      } else stocks.push(...rows.map(row => normalizeStock(row, name, futuresMap, optionsMap)));
      const count = officialConstituentCounts.get(name) || rows.length || stocks.filter(stock => stock.sector === name).length;
      sectors.push({ name, index, count, change: market.fromOpen ?? num(summary?.percentChange ?? summary?.variation), last: market.last || num(summary?.last), live: true, market });
    } catch (error) {
      // Some sector labels are not available on the public endpoint. Keep the index row and continue.
      sectors.push({ name, index, count: 0, change: num(summary?.percentChange ?? summary?.variation), last: num(summary?.last), live: false, market: null });
    }
  }
  const nifty = indexMap.get('NIFTY 50');
  const rolling = await getRollingReturns(sectorIndices);
  const uniqueStocks = [...new Map(stocks.map(stock => [stock.symbol, stock])).values()];
  const overall = { stocks: uniqueStocks.length, advances: uniqueStocks.filter(stock => stock.change > 0).length, declines: uniqueStocks.filter(stock => stock.change < 0).length, unchanged: uniqueStocks.filter(stock => stock.change === 0).length };
  const value = { fetchedAt: new Date().toISOString(), source: 'NSE India', nifty: { last: num(nifty?.last), change: num(nifty?.percentChange ?? nifty?.variation) }, overall, sectors, stocks, rolling };
  cache = { at: Date.now(), value };
  return value;
}

function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(body)); }
function staticFile(req, res) {
  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const relative = requestPath === '/' ? '/index.html' : requestPath;
  const file = path.join(staticRoot, relative);
  if (!file.startsWith(staticRoot) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return false;
  const ext = path.extname(file); const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res); return true;
}

async function start() {
  const dev = process.env.NODE_ENV !== 'production';
  const vite = dev ? await import('vite').then(mod => mod.createServer({ server: { middlewareMode: true } })) : null;
  http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/market') {
      json(res, 200, await getMarket());
    } else if (dev && vite) {
      vite.middlewares(req, res, () => { res.writeHead(404); res.end('Not found'); });
    } else if (!staticFile(req, res)) {
      res.writeHead(404); res.end('Not found');
    }
  } catch (error) {
    console.error(error.message);
    json(res, 502, { error: 'NSE data is temporarily unavailable', detail: error.message });
  }
  }).listen(port, () => console.log(`NiftyLens running at http://localhost:${port}`));
}
start();
