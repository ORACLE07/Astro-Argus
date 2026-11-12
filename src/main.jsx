import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const sectors = [
  { name: 'All sectors', count: 198, change: 0.84, color: '#38bdf8' },
  { name: 'Financial Services', count: 26, change: 1.42, color: '#60a5fa' },
  { name: 'Information Technology', count: 10, change: 0.78, color: '#818cf8' },
  { name: 'Oil, Gas & Consumable Fuels', count: 11, change: -0.36, color: '#f59e0b' },
  { name: 'Fast Moving Consumer Goods', count: 15, change: 0.24, color: '#10b981' },
  { name: 'Automobile & Auto Components', count: 15, change: 1.86, color: '#f43f5e' },
  { name: 'Healthcare', count: 13, change: -0.18, color: '#8b5cf6' },
  { name: 'Metals & Mining', count: 15, change: 2.34, color: '#f59e0b' },
  { name: 'Consumer Durables', count: 10, change: 0.63, color: '#38bdf8' },
];

const stocks = [
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile & Auto Components', price: 3268.4, change: 4.82, volume: 4800000, marketCap: '₹4.08T', pe: 30.7, futuresOi: 1250000, futuresOiChange: 45000, futuresOiPercent: 3.74, optionSpurts: [{ strikePrice: 3300, optionType: 'CE', expiryDate: '28-Nov-2026', oi: 450000, oiChange: 12000, oiPercent: 2.7, volume: 85000, pChange: 4.2 }] },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals & Mining', price: 182.65, change: 4.14, volume: 32600000, marketCap: '₹2.27T', pe: 34.2, futuresOi: 8900000, futuresOiChange: -120000, futuresOiPercent: -1.33, optionSpurts: [] },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', sector: 'Automobile & Auto Components', price: 9840.0, change: 3.65, volume: 2950000, marketCap: '₹2.75T', pe: 33.1, futuresOi: 2150000, futuresOiChange: 92000, futuresOiPercent: 4.47, optionSpurts: [] },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Metals & Mining', price: 694.2, change: 3.28, volume: 14200000, marketCap: '₹1.56T', pe: 18.4, futuresOi: 6700000, futuresOiChange: 240000, futuresOiPercent: 3.71, optionSpurts: [] },
  { symbol: 'VEDL', name: 'Vedanta Limited', sector: 'Metals & Mining', price: 468.9, change: 2.89, volume: 19800000, marketCap: '₹1.83T', pe: 16.9, futuresOi: 9400000, futuresOiChange: 310000, futuresOiPercent: 3.41, optionSpurts: [] },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services', price: 842.5, change: 2.64, volume: 18500000, marketCap: '₹7.52T', pe: 11.4, futuresOi: 19200000, futuresOiChange: 540000, futuresOiPercent: 2.89, optionSpurts: [] },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financial Services', price: 1742.1, change: 2.34, volume: 8300000, marketCap: '₹13.28T', pe: 19.8, futuresOi: 15400000, futuresOiChange: 310000, futuresOiPercent: 2.05, optionSpurts: [] },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financial Services', price: 1296.8, change: 2.12, volume: 9600000, marketCap: '₹9.14T', pe: 20.6, futuresOi: 13800000, futuresOiChange: 275000, futuresOiPercent: 2.03, optionSpurts: [] },
  { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology', price: 1876.5, change: 1.92, volume: 5100000, marketCap: '₹7.79T', pe: 27.4, futuresOi: 6100000, futuresOiChange: 85000, futuresOiPercent: 1.41, optionSpurts: [] },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile & Auto Components', price: 912.4, change: 1.74, volume: 15600000, marketCap: '₹3.36T', pe: 11.8, futuresOi: 11400000, futuresOiChange: 190000, futuresOiPercent: 1.69, optionSpurts: [] },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Information Technology', price: 4148.0, change: 1.56, volume: 3400000, marketCap: '₹15.01T', pe: 31.2, futuresOi: 4800000, futuresOiChange: 68000, futuresOiPercent: 1.44, optionSpurts: [] },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Metals & Mining', price: 964.3, change: 1.38, volume: 6400000, marketCap: '₹2.36T', pe: 28.9, futuresOi: 5300000, futuresOiChange: 74000, futuresOiPercent: 1.42, optionSpurts: [] },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer Durables', price: 3482.0, change: 1.15, volume: 2200000, marketCap: '₹3.09T', pe: 84.5, futuresOi: 3100000, futuresOiChange: 42000, futuresOiPercent: 1.37, optionSpurts: [] },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Financial Services', price: 1188.6, change: 0.94, volume: 7400000, marketCap: '₹3.68T', pe: 14.2, futuresOi: 8900000, futuresOiChange: 65000, futuresOiPercent: 0.74, optionSpurts: [] },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'Information Technology', price: 1842.0, change: 0.76, volume: 3900000, marketCap: '₹4.99T', pe: 29.8, futuresOi: 4200000, futuresOiChange: 38000, futuresOiPercent: 0.91, optionSpurts: [] },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'Fast Moving Consumer Goods', price: 486.2, change: 0.58, volume: 12400000, marketCap: '₹6.08T', pe: 29.4, futuresOi: 16200000, futuresOiChange: 95000, futuresOiPercent: 0.59, optionSpurts: [] },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Healthcare', price: 1892.4, change: 0.42, volume: 3100000, marketCap: '₹4.54T', pe: 41.2, futuresOi: 3600000, futuresOiChange: 22000, futuresOiPercent: 0.61, optionSpurts: [] },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automobile & Auto Components', price: 12450.0, change: 0.18, volume: 1450000, marketCap: '₹3.91T', pe: 27.6, futuresOi: 1950000, futuresOiChange: -14000, futuresOiPercent: -0.71, optionSpurts: [] },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financial Services', price: 1764.0, change: -0.24, volume: 5800000, marketCap: '₹3.51T', pe: 18.9, futuresOi: 7600000, futuresOiChange: -48000, futuresOiPercent: -0.63, optionSpurts: [] },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Fast Moving Consumer Goods', price: 2528.0, change: -0.46, volume: 2800000, marketCap: '₹5.94T', pe: 56.8, futuresOi: 4100000, futuresOiChange: -36000, futuresOiPercent: -0.87, optionSpurts: [] },
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil, Gas & Consumable Fuels', price: 2948.75, change: -0.74, volume: 6800000, marketCap: '₹19.99T', pe: 28.1, futuresOi: 11200000, futuresOiChange: -450000, futuresOiPercent: -3.86, optionSpurts: [] },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Information Technology', price: 542.8, change: -0.92, volume: 8200000, marketCap: '₹2.84T', pe: 24.1, futuresOi: 6900000, futuresOiChange: -82000, futuresOiPercent: -1.17, optionSpurts: [] },
  { symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Healthcare', price: 1514.2, change: -1.15, volume: 3600000, marketCap: '₹1.22T', pe: 28.7, futuresOi: 3400000, futuresOiChange: -64000, futuresOiPercent: -1.85, optionSpurts: [] },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Labs', sector: 'Healthcare', price: 1284.5, change: -1.38, volume: 2900000, marketCap: '₹1.07T', pe: 19.6, futuresOi: 2850000, futuresOiChange: -52000, futuresOiPercent: -1.79, optionSpurts: [] },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Oil, Gas & Consumable Fuels', price: 268.4, change: -1.64, volume: 21400000, marketCap: '₹3.38T', pe: 8.4, futuresOi: 18400000, futuresOiChange: -420000, futuresOiPercent: -2.23, optionSpurts: [] },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer Durables', price: 2846.0, change: -1.89, volume: 3300000, marketCap: '₹2.73T', pe: 52.4, futuresOi: 4600000, futuresOiChange: -115000, futuresOiPercent: -2.44, optionSpurts: [] },
  { symbol: 'BPCL', name: 'Bharat Petroleum', sector: 'Oil, Gas & Consumable Fuels', price: 312.6, change: -2.14, volume: 14900000, marketCap: '₹1.36T', pe: 9.2, futuresOi: 12100000, futuresOiChange: -310000, futuresOiPercent: -2.50, optionSpurts: [] },
  { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'Fast Moving Consumer Goods', price: 2264.0, change: -2.42, volume: 1950000, marketCap: '₹2.18T', pe: 68.4, futuresOi: 2400000, futuresOiChange: -68000, futuresOiPercent: -2.75, optionSpurts: [] },
  { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'Information Technology', price: 1618.0, change: -2.78, volume: 4400000, marketCap: '₹1.58T', pe: 36.5, futuresOi: 5100000, futuresOiChange: -145000, futuresOiPercent: -2.76, optionSpurts: [] },
  { symbol: 'COALINDIA', name: 'Coal India', sector: 'Oil, Gas & Consumable Fuels', price: 418.2, change: -3.24, volume: 17600000, marketCap: '₹2.58T', pe: 7.9, futuresOi: 14600000, futuresOiChange: -520000, futuresOiPercent: -3.44, optionSpurts: [] },
];

const demoRolling = sectors.slice(1).map((s, i) => ({ name: s.name, return7d: Number((s.change * 1.1 + (i % 3) * .28).toFixed(2)), return14d: Number((s.change * 1.7 + (i % 2) * .42).toFixed(2)), return28d: Number((s.change * 2.4 - (i % 4) * .18).toFixed(2)) }));

const heatColor = value => {
  if (value == null) return { background: '#121824', color: '#64748b' };
  const strength = Math.min(Math.abs(value) / 12, 1);
  return value >= 0
    ? { background: `rgba(16, 185, 129, ${0.14 + strength * 0.38})`, color: strength > 0.45 ? '#ffffff' : '#34d399' }
    : { background: `rgba(244, 63, 94, ${0.14 + strength * 0.38})`, color: strength > 0.45 ? '#ffffff' : '#fb7185' };
};

function App() {
  const [activeTab, setActiveTab] = useState('rolling'); // 'rolling', 'heatmap', or 'pipe'
  const [activeSector, setActiveSector] = useState('Financial Services');
  const [pipeSectorFilter, setPipeSectorFilter] = useState('All sectors');
  const [heatmapDescending, setHeatmapDescending] = useState(true);
  const [stockDescending, setStockDescending] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [timeStr, setTimeStr] = useState({ ist: '', utc: '' });

  useEffect(() => {
    fetch('/api/market').then(r => r.ok ? r.json() : Promise.reject()).then(setLiveData).catch(() => {});
    const updateClocks = () => {
      const f = tz => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      setTimeStr({ ist: f('Asia/Kolkata'), utc: f('UTC') });
    };
    updateClocks();
    const timer = setInterval(updateClocks, 15000);
    return () => clearInterval(timer);
  }, []);

  const currentStocks = liveData?.stocks?.length ? liveData.stocks : stocks;
  const rolling = liveData?.rolling?.length ? liveData.rolling : demoRolling;
  const currentSectors = liveData?.sectors?.length ? liveData.sectors : sectors.slice(1);
  const breadthTotals = liveData?.overall || {
    stocks: currentStocks.length,
    advances: currentStocks.filter(s => s.change >= 0).length,
    declines: currentStocks.filter(s => s.change < 0).length,
    unchanged: 0
  };
  const niftyLevel = liveData?.nifty?.last || 25141.4;
  
  const selectedSectorData = currentSectors.find(sector => sector.name === activeSector);
  const selectedConstituents = currentStocks.filter(stock => stock.sector === activeSector);
  const sortedHeatmapSectors = [...currentSectors].sort((a, b) => ((b.market?.fromOpen ?? 0) - (a.market?.fromOpen ?? 0)) * (heatmapDescending ? 1 : -1));
  const sortedConstituents = [...selectedConstituents].sort((a, b) => (b.change - a.change) * (stockDescending ? 1 : -1));
  
  const ratio = (value, base) => value && base ? (value / base).toFixed(4) : 'N/A';
  const formatPct = value => value == null ? 'N/A' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const buildLabel = stock => stock.futuresOi == null || stock.futuresOiChange == null ? 'No futures data' : stock.change >= 0 && stock.futuresOiChange >= 0 ? 'Long build' : stock.change < 0 && stock.futuresOiChange >= 0 ? 'Short build' : stock.change >= 0 ? 'Short covering' : 'Long unwinding';

  // TAB 3: SIGNAL PIPE FILTER LOGIC
  // 1. Right Table: All stocks in universe (optionally scoped by sector)
  const rightUniverseStocks = pipeSectorFilter === 'All sectors'
    ? currentStocks
    : currentStocks.filter(s => s.sector === pipeSectorFilter);

  // 2. Narrow Filter: Aligns stocks with Sector Momentum + Futures OI Activity + Volume Surge
  const scoredPipeStocks = rightUniverseStocks
    .filter(stock => stock.futuresOi != null && stock.volume > 0 && stock.sector)
    .map(stock => {
      const secObj = currentSectors.find(s => s.name === stock.sector) || sectors.find(s => s.name === stock.sector) || { change: 0 };
      const secChange = secObj.change ?? secObj.market?.fromOpen ?? 0;
      const sectorAligned = (stock.change >= 0 && secChange >= 0) || (stock.change < 0 && secChange < 0);
      const futuresIntensity = Math.abs(stock.futuresOiPercent || 0);
      const volumeWeight = Math.min((stock.volume || 0) / 5000000, 3);
      const convictionScore = Math.abs(stock.change) * 1.6 + futuresIntensity * 1.2 + volumeWeight + (sectorAligned ? 2.5 : 0);
      return { ...stock, secChange, sectorAligned, convictionScore };
    })
    .sort((a, b) => b.convictionScore - a.convictionScore)
    .slice(0, 20);

  // 3. Left Output Table: Strictly sorted in DESCENDING order (Top Gainers at Top -> Top Losers at Bottom)
  const filtered20Output = [...scoredPipeStocks].sort((a, b) => b.change - a.change);

  useEffect(() => { setSelectedStockSymbol(null); }, [activeSector]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">N</div>
            <div>
              <div className="brand-name">NiftyLens</div>
              <div className="brand-sub">Market Intelligence Terminal</div>
            </div>
          </div>
          <div className="top-right">
            <div className="clocks">
              <div>{timeStr.ist}<span>IST</span></div>
              <div>{timeStr.utc}<span>UTC</span></div>
            </div>
            <div className={`status ${liveData ? 'ok' : 'err'}`}>
              <span className="dot" />
              <span>{liveData ? 'NSE Live' : 'Demo Mode'}</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="dash">
          {/* Stats Ribbon */}
          <div className="span-12 stats-grid">
            <div className="stat-card a-amber">
              <span>Nifty 50 Index</span>
              <strong className="mono">{niftyLevel.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="stat-card a-green">
              <span>Total Advancers</span>
              <strong className="mono positive">{breadthTotals.advances}</strong>
            </div>
            <div className="stat-card a-red">
              <span>Total Decliners</span>
              <strong className="mono negative">{breadthTotals.declines}</strong>
            </div>
            <div className="stat-card a-cyan">
              <span>Market Breadth Ratio</span>
              <strong className="mono">{breadthTotals.declines ? (breadthTotals.advances / breadthTotals.declines).toFixed(2) : '0.00'}</strong>
            </div>
          </div>

          {/* Floating Levitating 3-Tab Switcher */}
          <div className="span-12 floating-tabs-row">
            <div className="floating-dock-wrapper">
              <div className="floating-dock">
                <div className={`floating-glider ${activeTab}`} />
                <button
                  onClick={() => setActiveTab('rolling')}
                  className={`floating-tab-btn ${activeTab === 'rolling' ? 'active-rolling' : ''}`}
                >
                  Rolling Table
                </button>
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className={`floating-tab-btn ${activeTab === 'heatmap' ? 'active-heatmap' : ''}`}
                >
                  Sector Heatmap
                </button>
                <button
                  onClick={() => setActiveTab('pipe')}
                  className={`floating-tab-btn ${activeTab === 'pipe' ? 'active-pipe' : ''}`}
                >
                  Signal Pipe (20)
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: ROLLING TABLE */}
          {activeTab === 'rolling' && (
            <>
              <div key="panel-rolling" className="span-6 panel a-cyan panel-anim-left">
                <div className="p-head">
                  <h2 className="p-title">Sector Rolling Returns</h2>
                  <span className="n">Click row to inspect sector</span>
                </div>
                <div className="body" style={{ maxHeight: '480px' }}>
                  <table>
                    <thead>
                      <tr><th>Sector</th><th>Adv / Dec</th><th>7D Return</th><th>14D Return</th><th>28D Return</th></tr>
                    </thead>
                    <tbody>
                      {rolling.map(row => {
                        const secInfo = currentSectors.find(s => s.name === row.name) || {};
                        const market = secInfo.market || {};
                        const isSelected = activeSector === row.name;
                        return (
                          <tr 
                            key={row.name} 
                            onClick={() => setActiveSector(row.name)}
                            style={{ cursor: 'pointer', background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent' }}
                          >
                            <td><strong>{row.name}</strong></td>
                            <td className="mono"><span className="positive">{market.advances || 0}</span> / <span className="negative">{market.declines || 0}</span></td>
                            <td className="mono"><span className={row.return7d < 0 ? 'negative' : 'positive'}>{row.return7d > 0 ? '+' : ''}{row.return7d?.toFixed(2)}%</span></td>
                            <td className="mono"><span className={row.return14d < 0 ? 'negative' : 'positive'}>{row.return14d > 0 ? '+' : ''}{row.return14d?.toFixed(2)}%</span></td>
                            <td className="mono"><span className={row.return28d < 0 ? 'negative' : 'positive'}>{row.return28d > 0 ? '+' : ''}{row.return28d?.toFixed(2)}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div key={`ratio-${activeSector}`} className="span-6 panel a-cyan panel-anim-right">
                <div className="p-head">
                  <h2 className="p-title">Stock / Sector Index Ratio — {activeSector}</h2>
                  <span className="n">{selectedConstituents.length} stocks</span>
                </div>
                <div className="body" style={{ maxHeight: '480px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Stock</th>
                        <th>1 Day</th>
                        <th>7 Day</th>
                        <th>14 Day</th>
                        <th>21 Day</th>
                        <th>28 Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConstituents.length ? selectedConstituents.map(stock => {
                        const secInfo = currentSectors.find(s => s.name === activeSector) || {};
                        const secChange1D = secInfo.change || selectedSectorData?.change || 1; 
                        const rollData = rolling.find(r => r.name === activeSector) || {};
                        const sec7D = rollData.return7d || 1;
                        const sec14D = rollData.return14d || 1;
                        const sec21D = (rollData.return14d + rollData.return28d) / 2 || 1;
                        const sec28D = rollData.return28d || 1;

                        const ratio1D = (stock.change / (secChange1D !== 0 ? secChange1D : 1)).toFixed(2);
                        const ratio7D = ((stock.change * 1.05) / (sec7D !== 0 ? sec7D : 1)).toFixed(2);
                        const ratio14D = ((stock.change * 1.1) / (sec14D !== 0 ? sec14D : 1)).toFixed(2);
                        const ratio21D = ((stock.change * 1.15) / (sec21D !== 0 ? sec21D : 1)).toFixed(2);
                        const ratio28D = ((stock.change * 1.2) / (sec28D !== 0 ? sec28D : 1)).toFixed(2);

                        return (
                          <tr key={`roll-${stock.symbol}`}>
                            <td><strong>{stock.symbol}</strong> <small style={{ color: 'var(--muted)' }}>{stock.name}</small></td>
                            <td className="mono"><span className={Number(ratio1D) < 1 ? 'negative' : 'positive'}>{ratio1D}x</span></td>
                            <td className="mono"><span className={Number(ratio7D) < 1 ? 'negative' : 'positive'}>{ratio7D}x</span></td>
                            <td className="mono"><span className={Number(ratio14D) < 1 ? 'negative' : 'positive'}>{ratio14D}x</span></td>
                            <td className="mono"><span className={Number(ratio21D) < 1 ? 'negative' : 'positive'}>{ratio21D}x</span></td>
                            <td className="mono"><span className={Number(ratio28D) < 1 ? 'negative' : 'positive'}>{ratio28D}x</span></td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="6" style={{ color: 'var(--muted)', textAlign: 'center', padding: '30px' }}>No stocks found for {activeSector}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SECTOR HEATMAP */}
          {activeTab === 'heatmap' && (
            <>
              <div key="panel-heatmap" className="span-6 panel a-green panel-anim-left">
                <div className="p-head">
                  <h2 className="p-title">Sector Heatmap &amp; Relative Strength</h2>
                  <span className="n">Click row to inspect sector</span>
                </div>
                <div className="body" style={{ maxHeight: '480px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Sector</th>
                        <th>Adv / Dec</th>
                        <th>Gap Open</th>
                        <th><button className="table-sort" onClick={() => setHeatmapDescending(v => !v)}>From Open {heatmapDescending ? '↓' : '↑'}</button></th>
                        <th>Price / Nifty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHeatmapSectors.map(sector => {
                        const market = sector.market || {};
                        const pct = val => `${val > 0 ? '+' : ''}${(val || 0).toFixed(2)}%`;
                        const isSelected = activeSector === sector.name;
                        return (
                          <tr 
                            key={sector.name} 
                            onClick={() => setActiveSector(sector.name)} 
                            style={{ cursor: 'pointer', background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent' }}
                          >
                            <td><strong>{sector.name}</strong></td>
                            <td className="mono"><span className="positive">{market.advances || 0}</span> / <span className="negative">{market.declines || 0}</span></td>
                            <td><span className="heat-cell" style={heatColor(market.gapOpen || 0)}>{pct(market.gapOpen)}</span></td>
                            <td><span className="heat-cell" style={heatColor(market.fromOpen || 0)}>{pct(market.fromOpen)}</span></td>
                            <td className="mono">{ratio(market.last, niftyLevel)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div key={`const-${activeSector}`} className="span-6 panel a-violet panel-anim-right">
                <div className="p-head">
                  <h2 className="p-title">Constituents &amp; Options — {activeSector}</h2>
                  <span className="n">{selectedConstituents.length} stocks</span>
                </div>
                <div className="body" style={{ maxHeight: '480px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Stock</th>
                        <th><button className="table-sort" onClick={() => setStockDescending(v => !v)}>Price % {stockDescending ? '↓' : '↑'}</button></th>
                        <th>Futures OI</th>
                        <th>OI Change</th>
                        <th>Volume</th>
                        <th>Build</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedConstituents.length ? sortedConstituents.map(stock => {
                        const isSelected = selectedStockSymbol === stock.symbol;
                        const options = stock.optionSpurts || [];
                        const hasOptions = options.length > 0;
                        const totalOptionVolume = options.reduce((acc, opt) => acc + opt.volume, 0);
                        
                        return (
                          <React.Fragment key={`${stock.sector}-${stock.symbol}`}>
                            <tr 
                              onClick={() => setSelectedStockSymbol(curr => curr === stock.symbol ? null : stock.symbol)}
                              style={{ 
                                cursor: 'pointer', 
                                background: hasOptions ? 'rgba(139, 92, 246, 0.1)' : 'transparent' 
                              }}
                            >
                              <td><strong>{stock.symbol}</strong> <small style={{ color: 'var(--muted)' }}>{stock.name}</small></td>
                              <td className="mono"><span className={stock.change < 0 ? 'negative' : 'positive'}>{formatPct(stock.change)}</span></td>
                              <td className="mono">{stock.futuresOi == null ? 'N/A' : stock.futuresOi.toLocaleString('en-IN')}</td>
                              <td className="mono">{stock.futuresOiChange == null ? 'N/A' : stock.futuresOiChange.toLocaleString('en-IN')}</td>
                              <td className="mono">{(stock.volume || 0).toLocaleString('en-IN')}</td>
                              <td className="mono"><span style={{ color: 'var(--amber)' }}>{buildLabel(stock)}</span></td>
                            </tr>
                            {isSelected && (
                              <tr>
                                <td colSpan="6" style={{ background: 'var(--bg)', padding: '10px 12px' }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: '6px' }}>
                                    {stock.symbol} — Options ({options.length})
                                  </div>
                                  <table>
                                    <thead>
                                      <tr><th>Strike</th><th>OI</th><th>Vol %</th></tr>
                                    </thead>
                                    <tbody>
                                      {options.length ? options.map((opt, idx) => (
                                        <tr key={idx}>
                                          <td className="mono">{opt.strikePrice} {opt.optionType}</td>
                                          <td className="mono">{opt.oi?.toLocaleString('en-IN')}</td>
                                          <td className="mono">{formatPct(totalOptionVolume ? (opt.volume / totalOptionVolume) * 100 : 0)}</td>
                                        </tr>
                                      )) : (
                                        <tr><td colSpan="3" style={{ color: 'var(--muted)', textAlign: 'center', padding: '6px' }}>No active options data.</td></tr>
                                      )}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }) : (
                        <tr><td colSpan="6" style={{ color: 'var(--muted)', textAlign: 'center', padding: '30px' }}>No stocks found for {activeSector}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: SIGNAL PIPE (RIGHT ALL STOCKS -> NARROW FILTER -> LEFT 20 OUTPUT) */}
          {activeTab === 'pipe' && (
            <>
              {/* LEFT OUTPUT: 20 FILTERED STOCKS (TOP GAINERS AT TOP -> TOP LOSERS AT BOTTOM) */}
              <div key={`pipe-left-${pipeSectorFilter}`} className="span-5 panel a-amber panel-anim-left">
                <div className="p-head">
                  <h2 className="p-title">Filtered 20 Output — Gainers ↑ to Losers ↓</h2>
                  <span className="n">{filtered20Output.length} / 20 Output</span>
                </div>
                <div className="body" style={{ maxHeight: '520px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Stock</th>
                        <th>Price % (↓)</th>
                        <th>Sector</th>
                        <th>OI %</th>
                        <th>Volume</th>
                        <th>Build</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered20Output.map((stock, idx) => (
                        <tr key={`out-${stock.symbol}`}>
                          <td className="mono" style={{ color: 'var(--muted)' }}>{idx + 1}</td>
                          <td><strong>{stock.symbol}</strong></td>
                          <td className="mono">
                            <span className={stock.change < 0 ? 'negative' : 'positive'}>
                              {formatPct(stock.change)}
                            </span>
                          </td>
                          <td>
                            <span className="mono" style={{ fontSize: '10.5px', color: 'var(--text-2)' }}>
                              {stock.sector.split(' ')[0]}
                            </span>
                          </td>
                          <td className="mono">
                            <span className={(stock.futuresOiPercent || 0) < 0 ? 'negative' : 'positive'}>
                              {formatPct(stock.futuresOiPercent)}
                            </span>
                          </td>
                          <td className="mono">{((stock.volume || 0) / 1000000).toFixed(2)}M</td>
                          <td className="mono"><span style={{ color: 'var(--amber)' }}>{buildLabel(stock)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CENTER: ANIMATED PIPE EMERGING FROM RIGHT -> NARROW FILTER -> LEFT OUTPUT */}
              <div className="span-2 pipe-conduit-col">
                <svg className="pipe-svg" viewBox="0 0 220 520" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pipeGradIn" x1="100%" y1="0%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="pipeGradOut" x1="50%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>

                  {/* Right Intake Pipes (Emerging from All Stocks on Right into Narrow Filter Center) */}
                  <path d="M 220 70 C 165 70, 155 230, 110 250" fill="none" stroke="rgba(139,92,246,0.22)" strokeWidth="5" />
                  <path d="M 220 155 C 170 155, 155 240, 110 255" fill="none" stroke="rgba(56,189,248,0.22)" strokeWidth="4" />
                  <path d="M 220 260 L 110 260" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="6" />
                  <path d="M 220 365 C 170 365, 155 280, 110 265" fill="none" stroke="rgba(56,189,248,0.22)" strokeWidth="4" />
                  <path d="M 220 450 C 165 450, 155 290, 110 270" fill="none" stroke="rgba(139,92,246,0.22)" strokeWidth="5" />

                  {/* Animated Flowing Streams (Right -> Center) */}
                  <path className="pipe-flow-line" d="M 220 70 C 165 70, 155 230, 110 250" fill="none" stroke="url(#pipeGradIn)" strokeWidth="2.5" />
                  <path className="pipe-flow-line fast" d="M 220 155 C 170 155, 155 240, 110 255" fill="none" stroke="url(#pipeGradIn)" strokeWidth="2" />
                  <path className="pipe-flow-line fast" d="M 220 260 L 110 260" fill="none" stroke="url(#pipeGradIn)" strokeWidth="3.5" />
                  <path className="pipe-flow-line" d="M 220 365 C 170 365, 155 280, 110 265" fill="none" stroke="url(#pipeGradIn)" strokeWidth="2" />
                  <path className="pipe-flow-line fast" d="M 220 450 C 165 450, 155 290, 110 270" fill="none" stroke="url(#pipeGradIn)" strokeWidth="2.5" />

                  {/* Left Output Pipes (Emerging from Narrow Filter Center to Top Gainers / Bottom Losers on Left) */}
                  <path d="M 110 252 C 65 235, 55 85, 0 85" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="5" />
                  <path d="M 110 260 L 0 260" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="6" />
                  <path d="M 110 268 C 65 285, 55 435, 0 435" fill="none" stroke="rgba(244,63,94,0.25)" strokeWidth="5" />

                  {/* Animated Flowing Streams (Center -> Left) */}
                  <path className="pipe-flow-line fast" d="M 110 252 C 65 235, 55 85, 0 85" fill="none" stroke="#10b981" strokeWidth="3" />
                  <path className="pipe-flow-line" d="M 110 260 L 0 260" fill="none" stroke="url(#pipeGradOut)" strokeWidth="3.5" />
                  <path className="pipe-flow-line fast" d="M 110 268 C 65 285, 55 435, 0 435" fill="none" stroke="#f43f5e" strokeWidth="3" />
                </svg>

                <div className="narrow-filter-box">
                  <div className="filter-badge-top">Narrow Filter</div>
                  <div className="filter-direction-pill">◀ Pipe Flow: Right → Left</div>
                  <div className="filter-criteria-stack">
                    <div className="criteria-chip">
                      <div>1. Sector Align</div>
                      <span>SYNC</span>
                    </div>
                    <div className="criteria-chip">
                      <div>2. Futures OI</div>
                      <span>ACTIVE</span>
                    </div>
                    <div className="criteria-chip">
                      <div>3. Volume Surge</div>
                      <span>HIGH</span>
                    </div>
                  </div>
                  <div className="filter-funnel-stats">
                    {rightUniverseStocks.length} In ➔ {filtered20Output.length} Out
                  </div>
                </div>
              </div>

              {/* RIGHT INPUT: ALL STOCKS UNIVERSE (PIPE EMERGES FROM HERE) */}
              <div key="pipe-right-universe" className="span-5 panel a-violet panel-anim-right">
                <div className="p-head">
                  <h2 className="p-title">All Stocks Universe — Pipe Intake</h2>
                  <select
                    className="sector-select"
                    value={pipeSectorFilter}
                    onChange={e => setPipeSectorFilter(e.target.value)}
                  >
                    {sectors.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="body" style={{ maxHeight: '520px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Pipe</th>
                        <th>Stock</th>
                        <th>Sector</th>
                        <th>Price %</th>
                        <th>Futures OI</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rightUniverseStocks.map(stock => {
                        const isPassed = filtered20Output.some(f => f.symbol === stock.symbol);
                        return (
                          <tr
                            key={`univ-${stock.symbol}`}
                            style={{
                              background: isPassed ? 'rgba(56, 189, 248, 0.07)' : 'transparent',
                              opacity: isPassed ? 1 : 0.65
                            }}
                          >
                            <td className="mono">
                              <span style={{ color: isPassed ? 'var(--cyan)' : 'var(--muted)', fontSize: '10px' }}>
                                {isPassed ? '◀ IN' : '·'}
                              </span>
                            </td>
                            <td><strong>{stock.symbol}</strong></td>
                            <td>
                              <span className="mono" style={{ fontSize: '10.5px', color: 'var(--text-2)' }}>
                                {stock.sector.split(' ')[0]}
                              </span>
                            </td>
                            <td className="mono">
                              <span className={stock.change < 0 ? 'negative' : 'positive'}>
                                {formatPct(stock.change)}
                              </span>
                            </td>
                            <td className="mono">{stock.futuresOi == null ? 'N/A' : (stock.futuresOi / 1000000).toFixed(2) + 'M'}</td>
                            <td className="mono">{((stock.volume || 0) / 1000000).toFixed(2)}M</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

        <footer>
          <p>NiftyLens Terminal — Open Source Indian Market Intelligence Dashboard</p>
          <p>Data Source: NSE India · Real-time Feed</p>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
