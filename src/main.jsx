import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './rolling.css';
import './heatmap.css';

const sectors = [
  { name: 'All sectors', count: 198, change: 0.84, color: '#5f7cff' },
  { name: 'Financial Services', count: 26, change: 1.42, color: '#7c9bff' },
  { name: 'Information Technology', count: 10, change: 0.78, color: '#8e85ff' },
  { name: 'Oil, Gas & Consumable Fuels', count: 11, change: -0.36, color: '#f0a35b' },
  { name: 'Fast Moving Consumer Goods', count: 15, change: 0.24, color: '#78c8b0' },
  { name: 'Automobile & Auto Components', count: 15, change: 1.86, color: '#e98c78' },
  { name: 'Healthcare', count: 13, change: -0.18, color: '#9c91e5' },
  { name: 'Metals & Mining', count: 15, change: 2.34, color: '#d7a25c' },
  { name: 'Consumer Durables', count: 10, change: 0.63, color: '#74a6b5' },
];

const stocks = [
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile & Auto Components', price: 3268.4, change: 4.82, volume: '4.8M', marketCap: '₹4.08T', pe: 30.7, color: '#e98c78' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals & Mining', price: 182.65, change: 4.14, volume: '32.6M', marketCap: '₹2.27T', pe: 34.2, color: '#d7a25c' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financial Services', price: 1742.1, change: 2.34, volume: '8.3M', marketCap: '₹13.28T', pe: 19.8, color: '#7c9bff' },
  { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology', price: 1876.5, change: 1.92, volume: '5.1M', marketCap: '₹7.79T', pe: 27.4, color: '#8e85ff' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil, Gas & Consumable Fuels', price: 2948.75, change: -0.74, volume: '6.8M', marketCap: '₹19.99T', pe: 28.1, color: '#f0a35b' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Healthcare', price: 1724.3, change: -1.08, volume: '2.4M', marketCap: '₹4.14T', pe: 39.6, color: '#9c91e5' },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'Fast Moving Consumer Goods', price: 452.8, change: 0.68, volume: '9.2M', marketCap: '₹5.65T', pe: 29.8, color: '#78c8b0' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile & Auto Components', price: 784.15, change: 3.61, volume: '18.1M', marketCap: '₹2.89T', pe: 9.2, color: '#e98c78' },
];
const demoRolling = sectors.slice(1).map((s, i) => ({ name: s.name, return7d: Number((s.change * 1.1 + (i % 3) * .28).toFixed(2)), return14d: Number((s.change * 1.7 + (i % 2) * .42).toFixed(2)), return28d: Number((s.change * 2.4 - (i % 4) * .18).toFixed(2)) }));

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const sectorColors = ['#7c9bff','#8e85ff','#f0a35b','#78c8b0','#e98c78','#9c91e5','#d7a25c','#74a6b5','#bd7da6','#95aa6b'];
const heatColor = value => {
  if (value == null) return { background: '#f4f6f8', color: '#8995a2' };
  const strength = Math.min(Math.abs(value) / 12, 1);
  return value >= 0 ? { background: `rgba(13,154,114,${0.10 + strength * 0.36})`, color: strength > .45 ? '#fff' : '#087b5d' } : { background: `rgba(220,102,92,${0.10 + strength * 0.36})`, color: strength > .45 ? '#fff' : '#b24f48' };
};
const icon = (name, size = 18) => {
  const paths = { search: 'M11 4a7 7 0 1 0 4.9 12L21 21M16 16l5 5', grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', chart: 'M4 19V5M4 19h17M8 16l3-4 3 2 5-7', bookmark: 'M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z', settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.4 1.4-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.4-1.4.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 10.9a1.7 1.7 0 0 0-.34-1.88L9 8.96l1.4-1.4.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.37 6.4V5h2v1.4a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.4 1.4-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H22v2h-1.1A1.7 1.7 0 0 0 19.4 15z' };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
};

function App() {
  const [activeSector, setActiveSector] = useState('All sectors');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('change');
  const [saved, setSaved] = useState([]);
  const [heatmapDescending, setHeatmapDescending] = useState(true);
  const [stockDescending, setStockDescending] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [liveData, setLiveData] = useState(null);
  useEffect(() => { fetch('/api/market').then(r => r.ok ? r.json() : Promise.reject()).then(setLiveData).catch(() => {}); }, []);
  const currentStocks = liveData?.stocks?.length ? liveData.stocks : stocks;
  const rolling = liveData?.rolling?.length ? liveData.rolling : demoRolling;
  const currentSectors = liveData?.sectors?.length ? [{ name: 'All sectors', count: currentStocks.length, change: liveData.nifty.change, color: '#5f7cff' }, ...liveData.sectors.map((s, i) => ({ ...s, color: s.color || sectorColors[i % sectorColors.length] }))] : sectors;
  const stockRotation = [...currentStocks].sort((a, b) => b.change - a.change).slice(0, 5).concat([...currentStocks].sort((a, b) => a.change - b.change).slice(0, 5));
  const breadthTotals = liveData?.overall || { stocks: currentStocks.length, advances: 0, declines: 0, unchanged: 0 };
  const selectedSector = activeSector === 'All sectors' ? currentSectors[1]?.name : activeSector;
  const selectedSectorData = currentSectors.find(sector => sector.name === selectedSector);
  const niftyLevel = liveData?.nifty.last || 0;
  const selectedConstituents = currentStocks.filter(stock => stock.sector === selectedSector);
  const sortedHeatmapSectors = [...currentSectors.slice(1)].sort((a, b) => ((b.market?.fromOpen ?? 0) - (a.market?.fromOpen ?? 0)) * (heatmapDescending ? 1 : -1));
  const sortedConstituents = [...selectedConstituents].sort((a, b) => (b.change - a.change) * (stockDescending ? 1 : -1));
  const sectorVolume = selectedConstituents.reduce((total, stock) => total + (stock.volume || 0), 0);
  const selectedStock = selectedConstituents.find(stock => stock.symbol === selectedStockSymbol) || null;
  useEffect(() => { setSelectedStockSymbol(null); }, [selectedSector]);
  const formatPct = value => value == null ? 'N/A' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const buildLabel = stock => stock.futuresOi == null || stock.futuresOiChange == null ? 'No futures data' : stock.change >= 0 && stock.futuresOiChange >= 0 ? 'Long build' : stock.change < 0 && stock.futuresOiChange >= 0 ? 'Short build' : stock.change >= 0 ? 'Short covering' : 'Long unwinding';
  const ratio = (value, base) => value && base ? (value / base).toFixed(4) : 'N/A';
  const filtered = useMemo(() => currentStocks.filter(s => (activeSector === 'All sectors' || s.sector === activeSector) && `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => sort === 'price' ? b.price-a.price : sort === 'name' ? a.name.localeCompare(b.name) : b.change-a.change), [activeSector, query, sort, currentStocks]);
  const toggleSaved = (symbol) => setSaved(s => s.includes(symbol) ? s.filter(x => x !== symbol) : [...s, symbol]);
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">N</span><span>Nifty<span>Lens</span></span></div>
      <div className="workspace-label">WORKSPACE <button>⌄</button></div>
      <div className="workspace"><span className="workspace-dot" /> Market overview <span className="chev">›</span></div>
      <nav><button className="nav-active">{icon('grid')} <span>Market screener</span></button><button>{icon('chart')} <span>Market insights</span></button><button>{icon('bookmark')} <span>Watchlist <em>{saved.length || ''}</em></span></button></nav>
      <div className="sector-heading"><span>SECTORS</span><button>＋</button></div>
      <div className="sector-list">{currentSectors.map(s => <button key={s.name} className={activeSector === s.name ? 'sector-active' : ''} onClick={() => setActiveSector(s.name)}><span className="sector-dot" style={{background:s.color}} /><span className="sector-name">{s.name}</span><span className={`sector-change ${s.change < 0 ? 'negative' : ''}`}>{s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%</span></button>)}</div>
      <div className="sidebar-bottom"><button>{icon('settings')} Settings</button><div className="user"><span>AK</span><div><strong>Arjun Kapoor</strong><small>Pro workspace</small></div><b>•••</b></div></div>
    </aside>
    <main>
      <header><div className="breadcrumb">Markets <span>/</span> <b>{activeSector}</b></div><div className="top-actions"><div className="search">{icon('search',16)}<input placeholder="Search stocks, sectors..." value={query} onChange={e=>setQuery(e.target.value)} /><kbd>⌘ K</kbd></div><div className="status"><i/> {liveData ? 'NSE live' : 'Demo data'} <span>•</span> 12 Nov, 2026</div></div></header>
      <div className="content">
        <section className="hero"><div><div className="eyebrow"><span className="pulse"/> {liveData ? 'LIVE MARKET PULSE · NSE' : 'MARKET PULSE · DEMO'}</div><h1>Find your next<br/><i>conviction.</i></h1><p>Screen every stock across NIFTY sectors with a sharper view of what’s moving the market.</p></div><div className="hero-index"><span>NIFTY 50</span><strong>{(liveData?.nifty.last || 25141.4).toLocaleString('en-IN',{minimumFractionDigits:2})}</strong><b>{liveData?.nifty.change > 0 ? '+' : ''}{liveData?.nifty.change?.toFixed(2) || '+0.85'}% <small>today</small></b><div className="sparkline"><svg viewBox="0 0 250 60" preserveAspectRatio="none"><path d="M2 50 C20 48 22 32 40 36 S60 48 75 27 S96 30 112 34 S124 16 145 23 S160 38 175 21 S185 36 200 23 S225 27 248 4" /></svg></div><small>{liveData ? `Fetched ${new Date(liveData.fetchedAt).toLocaleTimeString()}` : 'Demo snapshot'} • NSE</small></div></section>
        <div className="stats"><div><span>Total stocks</span><strong>{breadthTotals.stocks}</strong><small>unique symbols across {currentSectors.length - 1} sectors</small></div><div><span>Advancers</span><strong className="green">{breadthTotals.advances}</strong><small>unique symbols</small></div><div><span>Decliners</span><strong className="red">{breadthTotals.declines}</strong><small>unique symbols</small></div><div><span>Market breadth</span><strong>{breadthTotals.declines ? (breadthTotals.advances / breadthTotals.declines).toFixed(2) : '0.00'}</strong><small><i className="tiny-up"/> advances / declines</small></div></div>
        <section className="section-title breadth-title"><div><span className="eyebrow">MARKET INTERNALS · OVERALL</span><h2>Market breadth</h2></div><span className="rolling-note">Across {currentSectors.length - 1} NSE sectors</span></section>
        <div className="table-wrap breadth-table"><table><thead><tr><th>UNIVERSE</th><th>STOCKS</th><th>ADVANCE</th><th>DECLINE</th><th>UNCHANGED</th><th>BREADTH</th><th>NIFTY 50</th></tr></thead><tbody><tr><td><strong>All unique NSE sector constituents</strong></td><td className="mono">{breadthTotals.stocks}</td><td className="heat-number positive">{breadthTotals.advances}</td><td className="heat-number negative">{breadthTotals.declines}</td><td className="muted mono">{breadthTotals.unchanged}</td><td className="mono">{breadthTotals.declines ? (breadthTotals.advances / breadthTotals.declines).toFixed(2) : '0.00'}</td><td><span className="heat-cell" style={heatColor(liveData?.nifty.change || 0)}>{liveData?.nifty.change > 0 ? '+' : ''}{(liveData?.nifty.change || 0).toFixed(2)}%</span></td></tr></tbody></table></div>
        <section className="section-title rolling-title"><div><span className="eyebrow">MOMENTUM · TRADING-DAY RETURNS</span><h2>Sector rolling returns</h2></div><span className="rolling-note">NSE index closes · constituent fallback where needed</span></section>
        <div className="table-wrap rolling-table"><table><thead><tr><th>SECTOR</th><th>STOCKS</th><th>7D RETURN</th><th>14D RETURN</th><th>28D RETURN</th><th>TREND</th></tr></thead><tbody>{rolling.map(row=>{const sector=currentSectors.find(s=>s.name===row.name); return <tr key={row.name}><td><strong>{row.name}</strong></td><td className="muted mono">{sector?.count || 0}</td>{['return7d','return14d','return28d'].map(key=><td key={key}><b className={row[key] < 0 ? 'negative' : 'positive'}>{`${row[key] == null ? 0 : row[key] > 0 ? '+' : ''}${(row[key] || 0).toFixed(2)}%`}</b></td>)}<td><div className="return-bars"><i className={row.return7d < 0 ? 'negative-bar' : ''} style={{height:`${Math.min(23, Math.max(4, Math.abs(row.return7d || 0)*3))}px`}}/><i className={row.return14d < 0 ? 'negative-bar' : ''} style={{height:`${Math.min(23, Math.max(4, Math.abs(row.return14d || 0)*3))}px`}}/><i className={row.return28d < 0 ? 'negative-bar' : ''} style={{height:`${Math.min(23, Math.max(4, Math.abs(row.return28d || 0)*3))}px`}}/></div></td></tr>})}</tbody></table></div>
        <section className="section-title heatmap-title"><div><span className="eyebrow">RELATIVE STRENGTH · ALL NSE SECTORS</span><h2>Sector heatmap</h2></div><span className="rolling-note"><i className="legend-positive"/> positive <i className="legend-negative"/> negative</span></section>
        <div className="table-wrap heatmap-table"><table><thead><tr><th>SECTOR</th><th>STOCKS</th><th>ADVANCE</th><th>DECLINE</th><th>GAP OPEN</th><th><button className="table-sort" onClick={() => setHeatmapDescending(value => !value)}>FROM OPEN {heatmapDescending ? '↓' : '↑'}</button></th><th>CURRENT PRICE</th><th>SECTOR / NIFTY 50</th></tr></thead><tbody>{sortedHeatmapSectors.map(sector=>{const market=sector.market||{}; const pct=value=>`${value>0?'+':''}${(value||0).toFixed(2)}%`; return <tr key={sector.name} className={selectedSector === sector.name ? 'selected-row' : ''} onClick={() => setActiveSector(sector.name)}><td><div className="heat-sector"><span className="sector-dot" style={{background:sector.color}}/><strong>{sector.name}</strong></div></td><td className="muted mono">{sector.count || 0}</td><td className="heat-number positive">{market.advances || 0}</td><td className="heat-number negative">{market.declines || 0}</td><td><span className="heat-cell" style={heatColor(market.gapOpen || 0)}>{pct(market.gapOpen)}</span></td><td><span className="heat-cell" style={heatColor(market.fromOpen || 0)}>{pct(market.fromOpen)}</span></td><td className="mono">{(market.last||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</td><td className="mono">{ratio(market.last, niftyLevel)}</td></tr>})}</tbody></table></div>
        <div className="constituent-heading"><div><span className="eyebrow">SELECTED SECTOR</span><h3>{selectedSector || 'Select a sector'}</h3></div><span className="rolling-note">{selectedConstituents.length} stocks · volume share by sector</span></div>
        <div className="table-wrap constituent-table"><table><thead><tr><th>STOCK</th><th><button className="table-sort" onClick={() => setStockDescending(value => !value)}>PRICE % {stockDescending ? '↓' : '↑'}</button></th><th>FUTURES OI</th><th>OI CHANGE</th><th>OI %</th><th>VOLUME</th><th>VOLUME %</th><th>BUILD</th><th>STOCK / SECTOR INDEX</th></tr></thead><tbody>{sortedConstituents.map(stock=>{const volumePercent=sectorVolume ? (stock.volume / sectorVolume) * 100 : 0; const isSelected = selectedStockSymbol === stock.symbol; const options = stock.optionSpurts || []; const totalOptionVolume = options.reduce((total, option) => total + option.volume, 0); return <React.Fragment key={`${stock.sector}-${stock.symbol}`}><tr className={`${isSelected ? 'selected-row ' : ''}${options.length ? 'has-options' : ''}`} onClick={() => setSelectedStockSymbol(current => current === stock.symbol ? null : stock.symbol)}><td><strong>{stock.symbol}</strong><small className="stock-name">{stock.name}</small></td><td><b className={stock.change < 0 ? 'negative' : 'positive'}>{formatPct(stock.change)}</b></td><td className="mono">{stock.futuresOi == null ? 'N/A' : stock.futuresOi.toLocaleString('en-IN')}</td><td className="mono">{stock.futuresOiChange == null ? 'N/A' : stock.futuresOiChange.toLocaleString('en-IN')}</td><td className="mono">{formatPct(stock.futuresOiPercent)}</td><td className="mono">{(stock.volume || 0).toLocaleString('en-IN')}</td><td className="mono">{formatPct(volumePercent)}</td><td><span className="build-label">{buildLabel(stock)}</span></td><td className="mono">{ratio(stock.price, selectedSectorData?.market?.last)}</td></tr>{isSelected && <tr className="option-popover-row"><td colSpan="9"><div className="option-popover"><div className="option-popover-title"><strong>{stock.symbol} · active calls & puts</strong><span>{options.length} contracts</span></div><table><thead><tr><th>ACTIVE STRIKE</th><th>OI</th><th>VOLUME %</th></tr></thead><tbody>{options.length ? options.map((option, index) => <tr key={`${stock.symbol}-option-${option.optionType}-${option.strikePrice}-${index}`}><td className="mono">{option.strikePrice.toLocaleString('en-IN')} {option.optionType} <small className="stock-name">{option.expiryDate}</small></td><td className="mono">{option.oi == null ? 'N/A' : option.oi.toLocaleString('en-IN')}</td><td className="mono">{formatPct(totalOptionVolume ? option.volume / totalOptionVolume * 100 : 0)}</td></tr>) : <tr><td colSpan="3" className="empty">No NSE active call or put contracts reported.</td></tr>}</tbody></table></div></td></tr>}</React.Fragment>})}</tbody></table></div>
        <footer><span>{liveData ? `Live NSE response · fetched ${new Date(liveData.fetchedAt).toLocaleTimeString()}` : 'NSE response unavailable · showing demo data'}</span><span>Source: NSE India · Data may be delayed</span></footer>
      </div>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />);
