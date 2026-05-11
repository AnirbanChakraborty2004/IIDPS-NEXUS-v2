import React, { useState } from 'react';
import {
  Shield, Activity, Database, Ban, RefreshCw,
  Download, WifiOff, Eye, AlertOctagon, Zap, Swords
} from 'lucide-react';
import { simulateAttack, simulateWave, clearLogs } from '../services/api';

const ACTION_GROUPS = [
  {
    label: 'Simulate Attacks',
    color: 'red',
    actions: [
      { icon: AlertOctagon, label: 'DoS Attack',        desc: 'Simulate a Denial-of-Service flood',     attackType: 'dos' },
      { icon: Swords,       label: 'DDoS Attack',       desc: 'Simulate distributed attack from 4 IPs', attackType: 'ddos' },
      { icon: Eye,          label: 'Port Scan',          desc: 'Simulate port scanning from internal IP', attackType: 'port_scan' },
      { icon: Ban,          label: 'Brute Force',        desc: 'Simulate SSH/RDP brute force attempt',    attackType: 'brute_force' },
      { icon: Database,     label: 'SQL Injection',      desc: 'Simulate SQL injection on web endpoint',  attackType: 'sql_injection' },
    ],
  },
  {
    label: 'Stress Test',
    color: 'orange',
    actions: [
      { icon: Activity,     label: 'Attack Wave (x5)',   desc: 'Fire 5 random attacks simultaneously',    isWave: true },
    ],
  },
  {
    label: 'System Controls',
    color: 'cyan',
    actions: [
      { icon: Shield,       label: 'Enable Protection',  desc: 'Activate all IDS/IPS rules',              isProtection: true },
      { icon: RefreshCw,    label: 'Clear All Logs',      desc: 'Wipe threat logs & reset DEFCON to 5',    isClear: true },
      { icon: Download,     label: 'Export Report',       desc: 'Download threat summary (coming soon)',    isDisabled: true },
    ],
  },
];

const colorMap = {
  red:    { border: 'border-red-500/30',    bg: 'bg-red-500/10',    hover: 'hover:bg-red-500/20',    text: 'text-red-400',    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]' },
  cyan:   { border: 'border-[#00f0ff]/30',  bg: 'bg-[#00f0ff]/10',  hover: 'hover:bg-[#00f0ff]/20',  text: 'text-[#00f0ff]',  glow: 'shadow-[0_0_12px_rgba(0,240,255,0.2)]' },
  orange: { border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  hover: 'hover:bg-orange-500/20',  text: 'text-orange-400',  glow: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
  purple: { border: 'border-purple-500/30',  bg: 'bg-purple-500/10',  hover: 'hover:bg-purple-500/20',  text: 'text-purple-400',  glow: 'shadow-[0_0_12px_rgba(168,85,247,0.2)]' },
};

const QuickActionsTab = () => {
  const [firing, setFiring] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleAction = async (action) => {
    if (action.isDisabled) return;

    setFiring(action.label);
    setLastResult(null);

    try {
      let result;
      if (action.attackType) {
        result = await simulateAttack(action.attackType);
      } else if (action.isWave) {
        result = await simulateWave();
      } else if (action.isClear) {
        result = await clearLogs();
      } else if (action.isProtection) {
        result = { status: 'success', message: 'Full protection is active.' };
      }

      setLastResult(result);
    } catch (e) {
      setLastResult({ status: 'error', message: 'Failed to execute action.' });
    }

    setTimeout(() => setFiring(null), 1200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="glass-panel flex items-center gap-3 py-3 px-4">
        <Zap className="w-5 h-5 text-[#00f0ff]" />
        <div>
          <h2 className="text-sm font-black text-white tracking-widest uppercase">Quick Actions</h2>
          <p className="text-xs text-gray-500">Simulate attacks & manage system</p>
        </div>
      </div>

      {/* Result Banner */}
      {lastResult && (
        <div className={`glass-panel py-3 px-4 text-sm font-mono border ${
          lastResult.status === 'success'
            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/10'
            : 'border-red-500/30 text-red-400 bg-red-900/10'
        }`}>
          ✦ {lastResult.message}
        </div>
      )}

      {ACTION_GROUPS.map(({ label, color, actions }) => {
        const c = colorMap[color];
        return (
          <div key={label} className="glass-panel">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 pb-2
                            border-b border-white/5 ${c.text}`}>
              {label}
            </h3>
            <div className="flex flex-col gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                const isFiring = firing === action.label;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action)}
                    disabled={action.isDisabled}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200
                                active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
                                ${c.border} ${c.bg} ${c.hover}
                                ${isFiring ? c.glow : ''}`}
                  >
                    <div className={`p-2 rounded-lg ${c.bg}`}>
                      <Icon className={`w-4 h-4 ${c.text} ${isFiring ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold text-gray-200">{action.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{action.desc}</div>
                    </div>
                    {isFiring && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                        EXECUTING…
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickActionsTab;