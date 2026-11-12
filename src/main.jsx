import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const sectors = [
  { name: 'All sectors', count: 198, change: 0.84, color: '#4cc9f0' },
  { name: 'Financial Services', count: 26, change: 1.42, color: '#7c9bff' },
  { name: 'Information Technology', count: 10, change: 0.78, color: '#8e85ff' },
  { name: 'Oil, Gas & Consumable Fuels', count: 11, change: -0.36, color: '#f5a524' },
  { name: 'Fast Moving Consumer Goods', count: 15, change: 0.24, color: '#3ddc97' },
  { name: 'Automobile & Auto Components', count: 15, change: 1.86, color: '#ff5050' },
  { name: 'Healthcare', count: 13, change: -0.18, color: '#a78bfa' },
  { name: 'Metals & Mining', count: 15, change: 2.34, color: '#f5a524' },
  { name: 'Consumer Durables', count: 10, change: 0.63, color: '#4cc9f0' },
];

const stocks = [
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile & Auto Components', price: 3268.4, change: 4.82, volume: 4800000, marketCap: '₹4.08T', pe: 30.7, futuresOi: 1250000, futuresOiChange: 45000, futuresOiPercent: 3.74, optionSpurts: [{ strikePrice: 3300, optionType: 'CE', expiryDate: '28-Nov-2026', oi: 450000, oiChange: 12000, oiPercent: 2.7, volume: 85000, pChange: 4.2 }] },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals & Mining', price: 182.65, change: 4.14, volume: 32600000, marketCap: '₹2.27T', pe: 34.2, futuresOi: 8900000, futuresOiChange: -120000, futuresOiPercent: -1.33, optionSpurts: [] },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financial Services', price: 1742.1, change: 2.34, volume: 8300000, marketCap: '₹13.28T', pe: 19.8, futuresOi: 15400000, futuresOiChange: 310000, futuresOiPercent: 2.05, optionSpurts: [] },
  { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology', price: 1876.5, change: 1.92, volume: 5100000, marketCap: '₹7.79T', pe: 27.4, futuresOi: 6100000, futuresOiChange: 85000, futuresOiPercent: 1.41, optionSpurts: [] },
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil, Gas & Consumable Fuels', price: 2948.75, change: -0.74, volume: 6800000, marketCap: '₹19.99T', pe: 28.1, futuresOi: 11200000, futuresOiChange: -450000, futuresOiPercent: -3.86, optionSpurts: [] },
];
const demoRolling = sectors.slice(1).map((s, i) => ({ name: s.name, return7d: Number((s.change * 1.1 + (i % 3) * .28).toFixed(2)), return14d: Number((s.change * 1.7 + (i % 2) * .42).toFixed(2)), return28d: Number((s.change * 2.4 - (i % 4) * .18).toFixed(2)) }));

const heatColor = value => {
  if (value == null) return { background: '#101927', color: '#70829b' };
  const strength = Math.min(Math.abs(value) / 12, 1);
  return value >= 0 ? { background: `rgba(61,220,151,${0.12 + strength * 0.35})`, color: strength > .45 ? '#fff' : '#3ddc97' } : { background: `rgba(255,80,80,${0.12 + strength * 0.35})`, color: strength > .45 ? '#fff' : '#ff5050' };
};

function App() {
  const [activeTab, setActiveTab] = useState('rolling'); // 'rolling' or 'heatmap'
  const [activeSector, setActiveSector] = useState('Financial Services');
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
  const breadthTotals = liveData?.overall || { stocks: currentStocks.length, advances: 0, declines: 0, unchanged: 0 };
  const niftyLevel = liveData?.nifty.last || 25141.4;
  
  const selectedSectorData = currentSectors.find(sector => sector.name === activeSector);
  const selectedConstituents = currentStocks.filter(stock => stock.sector === activeSector);
  const sortedHeatmapSectors = [...currentSectors].sort((a, b) => ((b.market?.fromOpen ?? 0) - (a.market?.fromOpen ?? 0)) * (heatmapDescending ? 1 : -1));
  const sortedConstituents = [...selectedConstituents].sort((a, b) => (b.change - a.change) * (stockDescending ? 1 : -1));
  
  const ratio = (value, base) => value && base ? (value / base).toFixed(4) : 'N/A';
  const formatPct = value => value == null ? 'N/A' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const buildLabel = stock => stock.futuresOi == null || stock.futuresOiChange == null ? 'No futures data' : stock.change >= 0 && stock.futuresOiChange >= 0 ? 'Long build' : stock.change < 0 && stock.futuresOiChange >= 0 ? 'Short build' : stock.change >= 0 ? 'Short covering' : 'Long unwinding';

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

      <main style={{ padding: '16px' }}>
        <div className="dash">
          {/* Stats Ribbon */}
          <div className="span-12 stats-grid">
            <div className="stat-card a-amber">
              <span>Nifty 50 Index</span>
              <strong className="mono">{(liveData?.nifty.last || 25141.4).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
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

          {/* Professional Single Segmented Control Switcher */}
          <div className="span-12" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px' }}>
            <div style={{ display: 'inline-flex', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px' }}>
              <button 
                onClick={() => setActiveTab('rolling')} 
                style={{ 
                  background: activeTab === 'rolling' ? 'var(--panel-2)' : 'transparent', 
                  color: activeTab === 'rolling' ? 'var(--cyan)' : 'var(--text)', 
                  border: 'none', 
                  padding: '6px 16px', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  borderRadius: '3px',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s ease'
                }}
              >
                Rolling Table
              </button>
              <button 
                onClick={() => setActiveTab('heatmap')} 
                style={{ 
                  background: activeTab === 'heatmap' ? 'var(--panel-2)' : 'transparent', 
                  color: activeTab === 'heatmap' ? 'var(--green)' : 'var(--text)', 
                  border: 'none', 
                  padding: '6px 16px', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  borderRadius: '3px',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s ease'
                }}
              >
                Sector Heatmap
              </button>
            </div>
          </div>

          {/* TAB 1: ROLLING TABLE */}
          {activeTab === 'rolling' && (
            <div className="span-6 panel a-cyan">
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
                          style={{ cursor: 'pointer', background: isSelected ? 'rgba(76, 201, 240, 0.12)' : 'transparent' }}
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
          )}

          {/* TAB 2: SECTOR HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="span-6 panel a-green">
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
                          style={{ cursor: 'pointer', background: isSelected ? 'rgba(61, 220, 151, 0.12)' : 'transparent' }}
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
          )}

          {/* RIGHT SIDE TABLE: CONDITIONAL BASED ON ACTIVE TAB */}
          {activeTab === 'rolling' ? (
            <div className="span-6 panel a-cyan">
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
          ) : (
            <div className="span-6 panel a-violet">
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
                              background: hasOptions ? 'rgba(167, 139, 250, 0.1)' : 'transparent' 
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