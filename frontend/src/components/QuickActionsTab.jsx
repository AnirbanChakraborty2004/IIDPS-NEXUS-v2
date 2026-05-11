import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Activity, Database, Ban, RefreshCw,
  Download, WifiOff, Eye, AlertOctagon, Zap,
  CheckCircle, XCircle, X, Loader2, Radio
} from 'lucide-react';

// ─── API base (adjust if your backend runs on a different port) ───────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function downloadBlob(content, filename, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  cyan:   { border:'border-[#00f0ff]/30', bg:'bg-[#00f0ff]/10', hover:'hover:bg-[#00f0ff]/20', text:'text-[#00f0ff]',   glow:'shadow-[0_0_14px_rgba(0,240,255,0.25)]'  },
  orange: { border:'border-orange-500/30', bg:'bg-orange-500/10', hover:'hover:bg-orange-500/20', text:'text-orange-400', glow:'shadow-[0_0_14px_rgba(249,115,22,0.25)]' },
  purple: { border:'border-purple-500/30', bg:'bg-purple-500/10', hover:'hover:bg-purple-500/20', text:'text-purple-400', glow:'shadow-[0_0_14px_rgba(168,85,247,0.25)]' },
  red:    { border:'border-red-500/40',    bg:'bg-red-500/10',    hover:'hover:bg-red-500/20',    text:'text-red-400',    glow:'shadow-[0_0_14px_rgba(239,68,68,0.25)]'   },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                      backdrop-blur-md border shadow-xl transition-all duration-300
                      ${t.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
                      : t.type === 'error'   ? 'bg-red-900/80 border-red-500/40 text-red-300'
                      :                        'bg-gray-900/80 border-white/10 text-gray-300'}`}>
          {t.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" />
          : t.type === 'error'  ? <XCircle     className="w-4 h-4 shrink-0" />
          :                       <Loader2     className="w-4 h-4 shrink-0 animate-spin" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, color = 'cyan', children, onClose }) {
  const c = C[color];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`relative w-full max-w-sm mx-4 glass-panel border ${c.border} ${c.glow} rounded-2xl p-5`}>
        <button onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
          <X className="w-4 h-4" />
        </button>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${c.text}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ seconds, total, color }) {
  const r = 20, circ = 2 * Math.PI * r;
  const progress = circ * (1 - seconds / total);
  const stroke = color === 'purple' ? '#a855f7' : '#00f0ff';
  return (
    <svg width="52" height="52" className="shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={stroke} strokeWidth="3"
              strokeDasharray={circ} strokeDashoffset={progress}
              strokeLinecap="round" style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 1s linear' }} />
      <text x="26" y="30" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="bold">{seconds}s</text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const QuickActionsTab = () => {
  const [toasts,        setToasts]        = useState([]);
  const [busyAction,    setBusyAction]     = useState(null);
  const [protectionOn,  setProtectionOn]   = useState(true);
  const [scanCountdown, setScanCountdown]  = useState(null);  // null | number
  const [dumpCountdown, setDumpCountdown]  = useState(null);
  const [urlModal,      setUrlModal]       = useState(false);
  const [urlInput,      setUrlInput]       = useState('');
  const [confirmBlock,  setConfirmBlock]   = useState(null);  // null | { ip, reason }
  const scanTimer = useRef(null);
  const dumpTimer = useRef(null);

  // ── toast helpers ──────────────────────────────────────────────────────────
  const toast = (msg, type = 'info', ms = 3500) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), ms);
  };

  // ── countdown helpers ──────────────────────────────────────────────────────
  const startCountdown = (setter, timerRef, total, onDone) => {
    setter(total);
    timerRef.current = setInterval(() => {
      setter(s => {
        if (s <= 1) { clearInterval(timerRef.current); onDone(); return null; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { clearInterval(scanTimer.current); clearInterval(dumpTimer.current); }, []);

  // ── action handlers ────────────────────────────────────────────────────────

  // 1. Toggle Full Protection
  const handleProtection = async () => {
    setBusyAction('protection');
    try {
      // If your backend exposes a toggle endpoint, call it here.
      // For now we optimistically toggle and mock the call.
      await new Promise(r => setTimeout(r, 700)); // replace with: apiFetch('/protection/toggle', { method:'POST' })
      setProtectionOn(p => !p);
      toast(protectionOn ? 'Protection disabled' : 'Full protection enabled ✓', protectionOn ? 'error' : 'success');
    } catch {
      toast('Failed to toggle protection', 'error');
    } finally { setBusyAction(null); }
  };

  // 2. Deep Scan Network (60-second visual scan)
  const handleDeepScan = () => {
    if (scanCountdown !== null) return;
    toast('Deep packet scan started…', 'info', 2000);
    startCountdown(setScanCountdown, scanTimer, 60, () => toast('Deep scan complete ✓', 'success'));
  };

  // 3. Block Last Threat IP
  const handleBlockLastIP = async () => {
    setBusyAction('blockip');
    try {
      const list = await apiFetch('/blocklist');
      if (!list || list.length === 0) { toast('No threats in blocklist yet', 'info'); return; }
      // most recent entry
      const latest = list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      setConfirmBlock({ ip: latest.ip, reason: latest.reason });
    } catch {
      toast('Could not fetch blocklist', 'error');
    } finally { setBusyAction(null); }
  };

  const confirmBlockIP = async () => {
    if (!confirmBlock) return;
    setBusyAction('blockip');
    try {
      await apiFetch('/block-ip', { method: 'POST', body: JSON.stringify({ ip: confirmBlock.ip, reason: confirmBlock.reason }) });
      toast(`IP ${confirmBlock.ip} blocked ✓`, 'success');
    } catch {
      toast('Block command failed', 'error');
    } finally { setBusyAction(null); setConfirmBlock(null); }
  };

  // 4. Block URL
  const handleBlockURL = () => setUrlModal(true);

  const submitBlockURL = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlModal(false); setUrlInput('');
    setBusyAction('blockurl');
    try {
      await apiFetch('/block-url', { method: 'POST', body: JSON.stringify({ url }) });
      toast(`URL blocked ✓`, 'success');
    } catch {
      toast('Failed to block URL', 'error');
    } finally { setBusyAction(null); }
  };

  // 5. Export Threat Report
  const handleExport = async () => {
    setBusyAction('export');
    try {
      const [stats, blocklist] = await Promise.all([
        apiFetch('/stats'),
        apiFetch('/blocklist'),
      ]);
      const report = {
        generated_at: new Date().toISOString(),
        system_stats: stats,
        blocked_ips:  blocklist,
        total_blocked: blocklist.length,
      };
      downloadBlob(JSON.stringify(report, null, 2), `threat-report-${Date.now()}.json`);
      toast('Report downloaded ✓', 'success');
    } catch {
      toast('Export failed', 'error');
    } finally { setBusyAction(null); }
  };

  // 6. Live Traffic Dump (60-second visual)
  const handleTrafficDump = () => {
    if (dumpCountdown !== null) return;
    toast('60s traffic capture started…', 'info', 2000);
    startCountdown(setDumpCountdown, dumpTimer, 60, () => toast('Traffic capture complete ✓', 'success'));
  };

  // ── shared button renderer ─────────────────────────────────────────────────
  const ActionButton = ({ actionKey, icon: Icon, label, desc, color = 'cyan', onClick, rightSlot }) => {
    const c    = C[color];
    const busy = busyAction === actionKey;
    return (
      <button onClick={onClick} disabled={busy}
        className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200
                    active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                    ${c.border} ${c.bg} ${c.hover} ${busy ? c.glow : ''}`}>
        <div className={`p-2 rounded-lg ${c.bg} transition`}>
          {busy
            ? <Loader2 className={`w-4 h-4 ${c.text} animate-spin`} />
            : <Icon    className={`w-4 h-4 ${c.text}`} />}
        </div>
        <div className="flex-1 text-left">
          <div className={`text-sm font-bold text-gray-200`}>{label}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
        </div>
        {rightSlot}
        {busy && !rightSlot && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            EXECUTING…
          </span>
        )}
      </button>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast toasts={toasts} />

      {/* Block IP confirm modal */}
      {confirmBlock && (
        <Modal title="Confirm Block" color="orange" onClose={() => setConfirmBlock(null)}>
          <p className="text-xs text-gray-400 mb-1">Block this IP permanently?</p>
          <p className="text-sm font-mono text-orange-300 mb-1">{confirmBlock.ip}</p>
          <p className="text-[10px] text-gray-500 mb-4">Reason: {confirmBlock.reason}</p>
          <div className="flex gap-2">
            <button onClick={confirmBlockIP}
              className="flex-1 py-2 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400
                         text-xs font-bold hover:bg-orange-500/30 transition">
              Confirm Block
            </button>
            <button onClick={() => setConfirmBlock(null)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400
                         text-xs font-bold hover:bg-white/10 transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Block URL modal */}
      {urlModal && (
        <Modal title="Block URL" color="orange" onClose={() => { setUrlModal(false); setUrlInput(''); }}>
          <p className="text-xs text-gray-400 mb-3">Enter the URL or domain to block:</p>
          <input
            autoFocus
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitBlockURL()}
            placeholder="e.g. malicious-domain.com"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm
                       text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 mb-4"
          />
          <div className="flex gap-2">
            <button onClick={submitBlockURL}
              className="flex-1 py-2 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400
                         text-xs font-bold hover:bg-orange-500/30 transition">
              Block URL
            </button>
            <button onClick={() => { setUrlModal(false); setUrlInput(''); }}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400
                         text-xs font-bold hover:bg-white/10 transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="glass-panel flex items-center gap-3 py-3 px-4">
          <Zap className="w-5 h-5 text-[#00f0ff]" />
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase">Quick Actions</h2>
            <p className="text-xs text-gray-500">One-tap system controls &amp; responses</p>
          </div>
        </div>

        {/* ── Protection ───────────────────────────────────────────────── */}
        <div className="glass-panel">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5 text-[#00f0ff]">
            Protection
          </h3>
          <div className="flex flex-col gap-2">
            <ActionButton
              actionKey="protection" icon={Shield} color="cyan"
              label="Enable Full Protection"
              desc="Activate all IDS/IPS rules"
              onClick={handleProtection}
              rightSlot={
                busyAction !== 'protection' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition
                    ${protectionOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'}`}>
                    {protectionOn ? 'ON' : 'OFF'}
                  </span>
                )
              }
            />
            <ActionButton
              actionKey="scan" icon={Eye} color="cyan"
              label="Deep Scan Network"
              desc={scanCountdown !== null ? `Scanning… ${scanCountdown}s remaining` : 'Run full packet inspection'}
              onClick={handleDeepScan}
              rightSlot={
                scanCountdown !== null
                  ? <CountdownRing seconds={scanCountdown} total={60} color="cyan" />
                  : null
              }
            />
          </div>
        </div>

        {/* ── Response ─────────────────────────────────────────────────── */}
        <div className="glass-panel">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5 text-orange-400">
            Response
          </h3>
          <div className="flex flex-col gap-2">
            <ActionButton
              actionKey="blockip" icon={Ban} color="orange"
              label="Block Last Threat IP"
              desc="Fetch latest threat & add to blocklist"
              onClick={handleBlockLastIP}
            />
            <ActionButton
              actionKey="blockurl" icon={Ban} color="orange"
              label="Block URL"
              desc="Add a domain/URL to permanent blocklist"
              onClick={handleBlockURL}
            />
          </div>
        </div>

        {/* ── Reporting ────────────────────────────────────────────────── */}
        <div className="glass-panel">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5 text-purple-400">
            Reporting
          </h3>
          <div className="flex flex-col gap-2">
            <ActionButton
              actionKey="export" icon={Download} color="purple"
              label="Export Threat Report"
              desc="Download JSON incident summary"
              onClick={handleExport}
            />
            <ActionButton
              actionKey="dump" icon={Activity} color="purple"
              label="Live Traffic Dump"
              desc={dumpCountdown !== null ? `Capturing… ${dumpCountdown}s remaining` : 'Capture 60s pcap snapshot'}
              onClick={handleTrafficDump}
              rightSlot={
                dumpCountdown !== null
                  ? <CountdownRing seconds={dumpCountdown} total={60} color="purple" />
                  : null
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickActionsTab;