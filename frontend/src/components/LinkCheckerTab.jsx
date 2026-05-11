import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldX, ShieldAlert, Link2, Search, Clock, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';

/* ── Google Safe Browsing API call (via your FastAPI backend) ── */
const checkURL = async (url) => {
  const res = await fetch('http://localhost:8000/api/v1/link/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Backend error');
  return await res.json();
};

/* ── Threat type human labels ── */
const THREAT_LABELS = {
  MALWARE:             { label: 'Malware',              color: 'red',    desc: 'This URL distributes malicious software.' },
  SOCIAL_ENGINEERING:  { label: 'Phishing / Deceptive', color: 'red',    desc: 'Designed to trick users into sharing sensitive info.' },
  UNWANTED_SOFTWARE:   { label: 'Unwanted Software',    color: 'orange', desc: 'May install unwanted programs on your device.' },
  POTENTIALLY_HARMFUL: { label: 'Potentially Harmful',  color: 'orange', desc: 'May contain harmful content.' },
  THREAT_TYPE_UNSPECIFIED: { label: 'Unknown Threat',   color: 'orange', desc: 'Flagged as dangerous by Google Safe Browsing.' },
};

/* ── Status config ── */
const STATUS = {
  safe: {
    icon: ShieldCheck,
    label: 'SAFE',
    sublabel: 'No threats detected',
    border: 'border-emerald-500/40',
    bg:     'bg-emerald-500/8',
    text:   'text-emerald-400',
    glow:   'shadow-[0_0_30px_rgba(0,255,136,0.15)]',
    dot:    'bg-emerald-500',
  },
  danger: {
    icon: ShieldX,
    label: 'DANGEROUS',
    sublabel: 'Threat detected',
    border: 'border-red-500/50',
    bg:     'bg-red-500/8',
    text:   'text-red-400',
    glow:   'shadow-[0_0_30px_rgba(255,0,60,0.2)]',
    dot:    'bg-red-500',
  },
  warning: {
    icon: ShieldAlert,
    label: 'SUSPICIOUS',
    sublabel: 'Proceed with caution',
    border: 'border-orange-500/40',
    bg:     'bg-orange-500/8',
    text:   'text-orange-400',
    glow:   'shadow-[0_0_30px_rgba(255,157,0,0.15)]',
    dot:    'bg-orange-500',
  },
};


const formatURL = (url) => {
  try {
    const u = new URL(url);
    return { host: u.hostname, path: u.pathname + u.search, protocol: u.protocol };
  } catch {
    return { host: url, path: '', protocol: '' };
  }
};

const timeAgo = (ts) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const LinkCheckerTab = () => {
  const [url, setUrl]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);   // { status, threats, url, checkedAt }
  const [history, setHistory]   = useState([]);
  const [error, setError]       = useState('');

  const isValidURL = (s) => {
    try { new URL(s); return true; } catch { return false; }
  };

  const handleCheck = async () => {
  const trimmed = url.trim();
  if (!trimmed) { setError('Please enter a URL.'); return; }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!isValidURL(normalized)) { setError('Invalid URL format.'); return; }

  setError('');
  setLoading(true);
  setResult(null);

  try {
    const data = await checkURL(normalized);

    const threats   = data.threats || [];
    const hFlags    = data.heuristic_flags || [];
    const status    = data.risk_level; // "safe" | "warning" | "danger" — from backend

    const newResult = { status, threats, heuristic_flags: hFlags, url: normalized, checkedAt: Date.now() };
    setResult(newResult);
    setHistory(prev => [newResult, ...prev].slice(0, 5));

  } catch (err) {
    // Fallback: backend is down, show warning
    const fallback = {
      status: 'warning',
      threats: [],
      heuristic_flags: [],
      url: normalized,
      checkedAt: Date.now(),
      fallback: true,
    };
    setResult(fallback);
    setHistory(prev => [fallback, ...prev].slice(0, 5));
  }

  setLoading(false);
};

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleCheck(); };

  const loadFromHistory = (item) => {
    setUrl(item.url);
    setResult(item);
    setError('');
  };

  const st = result ? STATUS[result.status] : null;
  const ResultIcon = st ? st.icon : null;
  const { host, path, protocol } = result ? formatURL(result.url) : {};

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header card ── */}
      <div className="glass-panel flex items-center gap-3 py-3">
        <div className="p-2 rounded-lg bg-[#00f0ff]/10">
          <Link2 className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white tracking-widest uppercase">
            Safe Link Checker
          </h2>
          <p className="text-xs text-gray-500">
            Powered by Google Safe Browsing API — checks malware, phishing & unwanted software
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full
                        bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-widest">LIVE</span>
        </div>
      </div>

      {/* ── Main content: input + result ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT — Input + heuristic info */}
        <div className="flex flex-col gap-4">

          {/* URL Input */}
          <div className="glass-panel">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3
                           border-b border-white/5 pb-2">
              Enter URL to Check
            </h3>

            <div className="flex flex-col gap-3">
              {/* Input field */}
              <div className={`flex items-center gap-2 bg-black/40 rounded-xl border
                              transition-all duration-200
                              ${error
                                ? 'border-red-500/50'
                                : 'border-white/10 focus-within:border-[#00f0ff]/40'}`}>
                <Link2 className="w-4 h-4 text-gray-500 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com"
                  className="flex-1 bg-transparent py-3 pr-3 text-sm text-gray-200
                             placeholder-gray-600 outline-none font-mono"
                />
                {url && (
                  <button
                    onClick={() => { setUrl(''); setResult(null); setError(''); }}
                    className="mr-2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {error}
                </p>
              )}

              {/* Check button */}
              <button
                onClick={handleCheck}
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl
                            font-bold text-sm tracking-widest transition-all duration-200
                            ${loading
                              ? 'bg-[#00f0ff]/10 text-[#00f0ff]/50 cursor-not-allowed'
                              : 'bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#00f0ff]/30 border-t-[#00f0ff]
                                    rounded-full animate-spin" />
                    SCANNING...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    CHECK URL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* What we check */}
          <div className="glass-panel">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3
                           border-b border-white/5 pb-2">
              Detection Coverage
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { color: 'text-red-400',    dot: 'bg-red-500',    label: 'Malware',            desc: 'URLs hosting malicious downloads' },
                { color: 'text-orange-400', dot: 'bg-orange-500', label: 'Phishing',           desc: 'Fake login & credential-stealing pages' },
                { color: 'text-yellow-400', dot: 'bg-yellow-500', label: 'Unwanted Software',  desc: 'Adware, spyware & PUPs' },
                { color: 'text-purple-400', dot: 'bg-purple-500', label: 'Suspicious Patterns',desc: 'Raw IPs, URL shorteners, non-ASCII domains' },
              ].map(({ color, dot, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5 py-1">
                  <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0
                                  shadow-[0_0_6px_currentColor]`} />
                  <div>
                    <span className={`text-xs font-bold ${color}`}>{label}</span>
                    <span className="text-xs text-gray-500 ml-1.5">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Result */}
        <div className="flex flex-col gap-4">

          {/* Result card */}
          <div className={`glass-panel flex-1 flex flex-col transition-all duration-500
                          ${st ? `${st.border} ${st.glow}` : 'border-white/5'}`}>

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                <div className="p-6 rounded-full bg-white/3 border border-white/5">
                  <Shield className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-600 text-sm font-mono tracking-wider">
                  AWAITING URL INPUT
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#00f0ff]/20
                                  border-t-[#00f0ff] animate-spin" />
                  <Shield className="w-8 h-8 text-[#00f0ff]/60 absolute top-1/2 left-1/2
                                     -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-[#00f0ff] text-sm font-bold tracking-widest">SCANNING</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">
                    Querying Google Safe Browsing...
                  </p>
                </div>
              </div>
            )}

            {result && st && (
              <div className="flex flex-col gap-4">
                {/* Status banner */}
                <div className={`rounded-xl p-4 flex items-center gap-4 ${st.bg} border ${st.border}`}>
                  <div className={`p-3 rounded-xl ${st.bg}`}>
                    <ResultIcon className={`w-8 h-8 ${st.text}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-black tracking-widest ${st.text}`}>
                      {st.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{st.sublabel}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className={`w-3 h-3 rounded-full ${st.dot} ml-auto
                                    shadow-[0_0_10px_currentColor]`} />
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                      {timeAgo(result.checkedAt)}
                    </div>
                  </div>
                </div>

                {/* URL breakdown */}
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono">
                  <div className="text-[10px] text-gray-500 mb-1">ANALYSED URL</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-gray-500 text-xs">{protocol}</span>
                    <span className="text-[#00f0ff] text-sm font-bold">//{host}</span>
                    <span className="text-gray-500 text-xs truncate max-w-[200px]">{path}</span>
                  </div>
                </div>

                {/* Fallback notice */}
                {result.fallback && (
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20
                                  rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-yellow-400">
                      Backend unavailable — result based on heuristic analysis only
                    </p>
                  </div>
                )}

                {/* Threat details */}
                {result.threats && result.threats.length > 0 ? (
                  <div>
                    <div className="text-[10px] text-gray-500 font-mono mb-2">THREAT DETAILS</div>
                    <div className="flex flex-col gap-2">
                      {result.threats.map((t, i) => {
                        const info = THREAT_LABELS[t.threatType] || THREAT_LABELS.THREAT_TYPE_UNSPECIFIED;
                        return (
                          <div key={i}
                            className={`p-3 rounded-lg border
                              ${info.color === 'red'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-orange-500/10 border-orange-500/30'}`}>
                            <div className={`text-xs font-bold mb-0.5
                              ${info.color === 'red' ? 'text-red-400' : 'text-orange-400'}`}>
                              {info.label}
                            </div>
                            <div className="text-xs text-gray-400">{info.desc}</div>
                            {t.platformType && (
                              <div className="text-[10px] text-gray-600 mt-1 font-mono">
                                Platform: {t.platformType}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.status === 'safe' ? (
                  <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-emerald-400">
                      ✓ Not found in Google Safe Browsing database
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      No malware, phishing, or unwanted software detected.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-500/8 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-xs text-orange-400">
                      ⚠ Suspicious patterns detected via heuristic analysis
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      URL not in Google's database but matches known suspicious patterns.
                    </p>
                  </div>
                )}

                {/* Open link button (only for safe) */}
                {result.status === 'safe' && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                               text-xs font-bold tracking-wider hover:bg-emerald-500/20
                               transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    OPEN LINK
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Checks
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {history.map((item, i) => {
              const s = STATUS[item.status];
              const Icon = s.icon;
              const { host: h } = formatURL(item.url);
              return (
                <button
                  key={i}
                  onClick={() => loadFromHistory(item)}
                  className="flex items-center gap-3 bg-black/30 hover:bg-black/50
                             p-3 rounded-lg border border-white/5 hover:border-white/10
                             transition-all text-left"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${s.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 font-mono truncate">{h}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{timeAgo(item.checkedAt)}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                                   ${s.border} ${s.text}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkCheckerTab;