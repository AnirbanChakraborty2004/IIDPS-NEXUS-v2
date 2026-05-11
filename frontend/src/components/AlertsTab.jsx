import React, { useState } from 'react';
import { AlertTriangle, ShieldOff, Unlock } from 'lucide-react';

const mockAlerts = [
  { id: 1, type: 'Port Scan',    ip: '192.168.1.100', target: '10.0.0.5:22,80,443', time: new Date(Date.now() - 1000*60*2).toISOString(),  severity: 'high',     action: 'IP Blocked',  confidence: '98.5%' },
  { id: 2, type: 'DDoS Attempt', ip: '203.45.67.89',  target: '10.0.0.10:80',       time: new Date(Date.now() - 1000*60*15).toISOString(), severity: 'critical', action: 'IP Blocked',  confidence: '99.9%' },
  { id: 3, type: 'Brute Force',  ip: '10.0.0.25',     target: '10.0.0.5:22',        time: new Date(Date.now() - 1000*60*45).toISOString(), severity: 'medium',   action: 'Rate Limited',confidence: '85.2%' },
];

const mockBlocked = [
  { ip: '192.168.1.100', time: '2m ago' },
  { ip: '203.45.67.89',  time: '15m ago' },
  { ip: '114.5.6.7',     time: '1h ago' },
];

/* Attack type breakdown data */
const attackDist = [
  { label: 'DoS',        pct: 45, color: '#ff003c', shadow: '#ff003c' },
  { label: 'Port Scan',  pct: 30, color: '#ff9d00', shadow: '#ff9d00' },
  { label: 'Bruteforce', pct: 20, color: '#b000ff', shadow: '#b000ff' },
  { label: 'DDoS',       pct:  5, color: '#00f0ff', shadow: '#00f0ff' },
];

/* Build SVG donut slices from percentages */
const buildSlices = (data) => {
  const r = 80, cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return data.map((d) => {
    const dash = (d.pct / 100) * circumference;
    const gap  = circumference - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });
};

const AlertsTab = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const slices = buildSlices(attackDist);

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high':     return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium':   return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default:         return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Attack Distribution ── */}
      <div className="glass-panel">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-5 border-b border-white/5 pb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff003c] shadow-[0_0_6px_#ff003c]"></span>
          Attack Distribution
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* SVG donut chart */}
          <div className="relative flex-shrink-0" style={{ width:200, height:200 }}>
            <svg viewBox="0 0 200 200" width="200" height="200">
              {/* track */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="28"/>
              {/* slices */}
              {slices.map((s, i) => (
                <circle
                  key={i}
                  cx="100" cy="100" r="80"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="28"
                  strokeDasharray={`${s.dash} ${s.gap}`}
                  strokeDashoffset={-s.offset}
                  style={{
                    transform:       'rotate(-90deg)',
                    transformOrigin: '100px 100px',
                    filter:          `drop-shadow(0 0 6px ${s.shadow})`,
                    transition:      'stroke-dasharray 0.5s ease',
                  }}
                />
              ))}
              {/* centre hole */}
              <circle cx="100" cy="100" r="54" fill="var(--bg-panel, #111827)"/>
              <text x="100" y="96"  textAnchor="middle" fill="#94a3b8" fontSize="9"  fontFamily="monospace" fontWeight="600">TOTAL</text>
              <text x="100" y="112" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontFamily="monospace" fontWeight="800">3</text>
            </svg>
          </div>

          {/* Legend + bar breakdown */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {attackDist.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                         style={{ background: d.color, boxShadow: `0 0 6px ${d.shadow}` }}/>
                    {d.label}
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: d.color }}>{d.pct}%</span>
                </div>
                {/* progress bar */}
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${d.pct}%`,
                      background: d.color,
                      boxShadow:  `0 0 8px ${d.shadow}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Real-Time Threat Feed ── */}
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400"/>
            Real-Time Threat Feed
          </h2>
          <span className="text-xs text-gray-500 font-mono">Last 10 Threats</span>
        </div>

        <div className="flex flex-col gap-2">
          {mockAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-black/40 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'animate-ping' : ''} bg-current`}></div>
                <div>
                  <div className="font-bold text-sm">{alert.type}</div>
                  <div className="text-xs opacity-80 font-mono mt-1">{alert.ip} &rarr; {alert.target}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono opacity-80">
                <span>{new Date(alert.time).toLocaleTimeString()}</span>
                <span className="px-2 py-1 bg-black/40 rounded border border-current">{alert.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Threat Details (inline) ── */}
      {selectedAlert && (
        <div className="glass-panel border-purple-500/30 bg-purple-900/10 relative">
          <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-500/30 pb-2">Threat Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-mono text-gray-300">
            <div><span className="text-gray-500">Attack Type:</span><br/>{selectedAlert.type}</div>
            <div><span className="text-gray-500">Source IP:</span><br/><span className="text-red-400">{selectedAlert.ip}</span></div>
            <div><span className="text-gray-500">Target:</span><br/>{selectedAlert.target}</div>
            <div><span className="text-gray-500">Time:</span><br/>{new Date(selectedAlert.time).toLocaleString()}</div>
            <div><span className="text-gray-500">Confidence:</span><br/>{selectedAlert.confidence}</div>
            <div><span className="text-gray-500">Action:</span><br/><span className="text-emerald-400">{selectedAlert.action}</span></div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded border border-blue-500/30 text-xs font-bold transition-colors">View Full Log</button>
            <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded border border-emerald-500/30 text-xs font-bold transition-colors">Whitelist IP</button>
            <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded border border-gray-500/30 text-xs font-bold transition-colors ml-auto">Close</button>
          </div>
        </div>
      )}

      {/* ── Blocked IPs ── */}
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldOff className="w-4 h-4 text-red-500"/>
            Blocked IP Addresses
          </h2>
          <span className="text-xs text-gray-500 font-mono">Total Blocked: 15</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockBlocked.map((block, idx) => (
            <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-red-500/20">
              <div>
                <div className="font-mono text-sm text-red-400">{block.ip}</div>
                <div className="text-xs text-gray-500">{block.time}</div>
              </div>
              <button className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors">
                <Unlock className="w-3 h-3"/> Unblock
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AlertsTab;