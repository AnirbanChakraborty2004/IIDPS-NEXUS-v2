import React from 'react';
import { Activity, Database, AlertTriangle, Shield, ShieldOff } from 'lucide-react';
import VoicePanel from './VoicePanel';
import ShieldAnimation from './Shieldanimation .jsx';

/* Desktop-only ring animation */
const RingAnimation = () => (
  <svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes spinCW  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
      @keyframes spinCCW { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }
      .r1 { transform-origin: 100px 100px; animation: spinCW  12s linear infinite; }
      .r2 { transform-origin: 100px 100px; animation: spinCCW  8s linear infinite; }
      .r3 { transform-origin: 100px 100px; animation: spinCW   5s linear infinite; }
    `}</style>
    <circle className="r1" cx="100" cy="100" r="90" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="1.5" strokeDasharray="12 6" />
    <circle className="r2" cx="100" cy="100" r="70" fill="none" stroke="rgba(0,240,255,0.45)" strokeWidth="2"   strokeDasharray="8 4"  />
    <circle className="r3" cx="100" cy="100" r="50" fill="none" stroke="#00f0ff"              strokeWidth="1.5" strokeDasharray="4 8"  />
    <circle cx="100" cy="100" r="28" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.2)" strokeWidth="1" />
    <text x="100" y="97"  textAnchor="middle" fill="rgba(0,240,255,0.6)" fontSize="8" fontFamily="monospace">IIDPS</text>
    <text x="100" y="110" textAnchor="middle" fill="rgba(0,240,255,0.6)" fontSize="8" fontFamily="monospace">NEXUS</text>
  </svg>
);

/* Helper: format bandwidth */
const formatBandwidth = (mbps) => {
  if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
  return `${(mbps * 1024).toFixed(0)} KB/s`;
};

/* Helper: format time from ISO string */
const formatTime = (isoStr) => {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  } catch {
    return isoStr;
  }
};

/* Helper: get severity color class */
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'yellow';
    default: return 'yellow';
  }
};

/* Helper: compute attack distribution from alerts */
const computeAttackDist = (alerts) => {
  const typeColors = {
    'DoS': '#ff003c',
    'Port Scan': '#ff9d00',
    'Brute Force': '#b000ff',
    'DDoS': '#00f0ff',
    'AI Triggered Attack Simulation': '#ff003c',
  };
  const defaultColor = '#6366f1';
  const counts = {};
  let total = alerts.length || 1;

  alerts.forEach(a => {
    const t = a.type || 'Unknown';
    counts[t] = (counts[t] || 0) + 1;
  });

  return Object.entries(counts).map(([label, count]) => ({
    label,
    pct: Math.round((count / total) * 100),
    color: typeColors[label] || defaultColor,
  }));
};

const DashboardTab = ({ stats = {}, alerts = [] }) => {
  const bandwidth = stats.bandwidth_mbps || 0;
  const connections = stats.active_connections || 0;
  const threatsBlocked = stats.threats_blocked || 0;
  const defcon = stats.defcon_level || 5;
  const attackDist = computeAttackDist(alerts);

  return (
    <>
      {/* ══════════════════════════════════════
              MOBILE  (hidden on md+)
         ══════════════════════════════════════ */}
      <div className="md:hidden">

        {/* ── FULL VIEWPORT HERO ── */}
        <div style={{
          position:       'relative',
          width:          '100vw',
          height:         '100svh',
          marginLeft:     '-1rem',
          marginTop:      '-0.5rem',
          overflow:       'hidden',
          flexShrink:      0,
        }}>
          <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, #050f24 0%, #03071a 70%)',
              }}>
            <ShieldAnimation size={Math.min(window.innerWidth, 420)} />
          </div>

          {/* centred overlay text */}
          <div style={{
            position:       'absolute',
            inset:           0,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            marginTop:      "400px",
            textAlign:      'center',
            padding:        '0 1.5rem',
          }}>
            <h1 style={{
              margin:        0,
              fontSize:      '2rem',
              fontWeight:    900,
              color:         '#ffffff',
              letterSpacing: '0.18em',
              textShadow:    '0 0 30px rgba(0,240,255,0.6), 0 2px 10px rgba(0,0,0,0.9)',
            }}>
              IIDPS NEXUS
            </h1>

            <p style={{
              margin:        '0.5rem 0 0',
              fontSize:      '0.78rem',
              fontWeight:    600,
              color:         '#00f0ff',
              letterSpacing: '0.26em',
              textShadow:    '0 0 14px rgba(0,240,255,0.9)',
            }}>
              DEFCON {defcon} — {threatsBlocked} Threats Blocked
            </p>

            {/* SECURE badge */}
            <div style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.4rem',
              marginTop:     '1.1rem',
              padding:       '5px 16px',
              background:    defcon <= 2 ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
              border:        defcon <= 2 ? '1px solid rgba(255,0,0,0.45)' : '1px solid rgba(0,255,0,0.45)',
              borderRadius:  '999px',
              color:         defcon <= 2 ? '#ff4444' : '#00ff00',
              fontSize:      '0.68rem',
              fontWeight:    700,
              letterSpacing: '0.22em',
              textShadow:    defcon <= 2 ? '0 0 10px rgba(255,0,0,0.6)' : '0 0 10px rgba(0,255,0,0.6)',
            }}>
              <span style={{
                display:      'inline-block',
                width:         8,
                height:        8,
                borderRadius: '50%',
                background:   defcon <= 2 ? '#ff4444' : '#00ff00',
                boxShadow:    defcon <= 2 ? '0 0 8px #ff4444' : '0 0 8px #00ff00',
              }} />
              {defcon <= 2 ? 'THREAT DETECTED' : 'SECURE'}
            </div>
          </div>
        </div>

        {/* ── SECTIONS BELOW HERO ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', paddingTop:'1rem' }}>

          {/* Vanguard AI // J.A.R.V.I.S */}
          <VoicePanel />

          {/* Network Telemetry */}
          <div className="glass-panel">
            <h2 className="section-header" style={{ marginBottom:'0.75rem' }}>Network Telemetry</h2>
            <div style={{ display:'flex', gap:'1rem', marginBottom:'0.5rem', fontSize:'0.72rem', fontFamily:'monospace' }}>
              <span style={{ color:'#60a5fa', fontWeight:700 }}>Bandwidth: {formatBandwidth(bandwidth)}</span>
              <span style={{ color:'#00f0ff', fontWeight:700 }}>Connections: {connections}</span>
            </div>
            <div style={{ fontSize:'0.72rem', color:'#6b7280', marginBottom:'0.5rem' }}>
              DEFCON Level: <span style={{ color: defcon <= 2 ? '#ef4444' : '#e2e8f0', fontWeight: 700 }}>{defcon}</span>
            </div>
            <div className="line-chart-bg" style={{ height:112, borderRadius:8, position:'relative', marginTop:8 }}>
              <svg style={{ position:'absolute', bottom:0, width:'100%', height:'100%' }}
                   preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40 L100,100 Z"
                      fill="rgba(0,240,255,0.15)" />
                <path d="M0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40"
                      fill="none" stroke="#00f0ff" strokeWidth="2" />
              </svg>
            </div>
          </div>

        </div>
      </div>
      {/* ── END MOBILE ── */}


      {/* ══════════════════════════════════════
              DESKTOP  (hidden on mobile)
         ══════════════════════════════════════ */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT – 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          <div className="hero-card h-150 rounded-xl p-8 flex flex-col justify-end">
          {/* Cyber Shield Image Placeholder via CSS or img */}
          <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, #050f24 0%, #03071a 70%)',
              }}>
            <ShieldAnimation size={Math.min(window.innerWidth, 420)} />
          </div>
          
          <div className="relative z-10 mt-auto">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider mb-2 drop-shadow-md">
              IIDPS NEXUS
            </h1>
            <p className="text-lg text-gray-300 font-medium mb-4">DEFCON {defcon} — {threatsBlocked} Threats Blocked</p>
            <div className="status-badge flex items-center gap-2 font-bold tracking-widest text-sm">
              <span className={`w-2 h-2 rounded-full animate-pulse ${defcon <= 2 ? 'bg-red-500' : 'bg-[#00ff00]'}`}></span>
              {defcon <= 2 ? 'THREAT DETECTED' : 'SECURE'}
            </div>
          </div>
        </div>

          <div className="glass-panel">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Network Telemetry</h2>
            <div className="flex gap-4 mb-4 text-xs font-mono">
              <span className="text-blue-400 font-bold">Bandwidth: {formatBandwidth(bandwidth)}</span>
              <span className="text-[#00f0ff] font-bold">Connections: {connections}</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">DEFCON Level: <span className={`font-bold ${defcon <= 2 ? 'text-red-400' : 'text-gray-200'}`}>{defcon}</span></div>
            <div className="h-32 w-full rounded-lg line-chart-bg relative mt-4">
              <svg className="w-full h-full absolute bottom-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40 L100,100 Z" fill="rgba(0,240,255,0.15)" />
                <path d="M0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40" fill="none" stroke="#00f0ff" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT – 3 cols */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <VoicePanel />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel flex flex-col items-center">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full border-b border-white/5 pb-2">Attack Distribution</h2>
              {alerts.length > 0 ? (
                <>
                  {/* Dynamic SVG donut */}
                  <div className="relative my-2" style={{ width: 150, height: 150 }}>
                    <svg viewBox="0 0 150 150" width="150" height="150">
                      <circle cx="75" cy="75" r="55" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="22"/>
                      {(() => {
                        const circumference = 2 * Math.PI * 55;
                        let offset = 0;
                        return attackDist.map((d, i) => {
                          const dash = (d.pct / 100) * circumference;
                          const gap = circumference - dash;
                          const el = (
                            <circle key={i} cx="75" cy="75" r="55" fill="none"
                              stroke={d.color} strokeWidth="22"
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={-offset}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px', filter: `drop-shadow(0 0 4px ${d.color})` }}
                            />
                          );
                          offset += dash;
                          return el;
                        });
                      })()}
                      <circle cx="75" cy="75" r="40" fill="var(--bg-panel, #111827)"/>
                      <text x="75" y="72" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="600">TOTAL</text>
                      <text x="75" y="85" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="monospace" fontWeight="800">{alerts.length}</text>
                    </svg>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-x-2 gap-y-3 text-xs font-mono mt-4">
                    {attackDist.map(d => (
                      <div key={d.label} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color, boxShadow: `0 0 5px ${d.color}` }}></div>
                        {d.label}: {d.pct}%
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <div className="relative my-2" style={{ width: 150, height: 150 }}>
                    <svg viewBox="0 0 150 150" width="150" height="150">
                      <circle cx="75" cy="75" r="55" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="22"/>
                      <circle cx="75" cy="75" r="40" fill="var(--bg-panel, #111827)"/>
                      <text x="75" y="72" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="600">TOTAL</text>
                      <text x="75" y="85" textAnchor="middle" fill="#4b5563" fontSize="14" fontFamily="monospace" fontWeight="800">0</text>
                    </svg>
                  </div>
                  <span className="text-sm">No attacks detected</span>
                </div>
              )}
            </div>
            <div className="glass-panel flex flex-col">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Quick Actions</h2>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                <button className="flex justify-between items-center bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 p-4 rounded-xl transition-all">
                  <span className="font-bold">Enable Protection</span><Shield className="w-5 h-5" />
                </button>
                <button className="flex justify-between items-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 p-4 rounded-xl transition-all">
                  <span className="font-bold">Deep Scan</span><Activity className="w-5 h-5" />
                </button>
                <button className="flex justify-between items-center bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 border border-gray-500/30 p-4 rounded-xl transition-all">
                  <span className="font-bold">Generate Report</span><Database className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Real-Time Threat Feed</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {alerts.length > 0 ? alerts.slice(0, 5).map((alert, idx) => {
                const color = getSeverityColor(alert.severity);
                return (
                  <div key={alert.id || idx} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        color==='red'    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                        color==='orange' ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' :
                                           'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`} />
                      <span className="text-sm text-gray-200">
                        {alert.type} from <span className="font-mono text-gray-400">{alert.ip}</span>
                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
                          alert.action==='Blocked' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {alert.action || 'Logged'}
                        </span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{formatTime(alert.time)}</span>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No threats detected — System is clean.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;