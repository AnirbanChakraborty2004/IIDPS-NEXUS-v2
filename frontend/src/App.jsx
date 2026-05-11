import React, { useState } from 'react';
import DashboardTab from './components/DashboardTab';
import AlertsTab from './components/AlertsTab';
import SettingsTab from './components/SettingsTab';
import QuickActionsTab from './components/QuickActionsTab';
import LinkCheckerTab from './components/LinkCheckerTab';
import { Shield, LayoutDashboard, Bell, BarChart2, Settings, Zap, Link2 } from 'lucide-react';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts',    label: 'Alerts',    icon: Bell },
  { id: 'quick',     label: 'Quick',     icon: Zap },
  { id: 'links',     label: 'Links',     icon: Link2 },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected] = useState(true);

  return (
    <div className="app-container min-h-screen flex flex-col text-gray-200">

      {/* ── DESKTOP HEADER (hidden on mobile) ── */}
      <header className="hidden md:flex glass-panel mb-6 mx-4 mt-4 lg:mx-8 lg:mt-6
                         flex-col md:flex-row justify-between items-center px-6 py-4 relative z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#00f0ff]" />
          <h1 className="text-2xl header-title m-0">IIDPS // NEXUS v1.0</h1>
        </div>

        {/* Desktop Tabs */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium
                          transition-all duration-300 capitalize
                          ${activeTab === id
                            ? 'bg-blue-600/30 text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected
              ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
              : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
            <span className="text-gray-300 font-medium tracking-wide">
              {isConnected ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="hidden lg:block text-gray-400 font-mono">
            Uptime: 3h 24m | User: Admin
          </div>
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 relative z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00f0ff]" />
          <h1 className="text-base header-title m-0 tracking-widest">IIDPS NEXUS</h1>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected
            ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'
            : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-300 font-mono tracking-wider">
            {isConnected ? 'SECURE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full relative z-10
                       px-4 pb-24 md:pb-6 md:px-4 lg:px-8
                       pt-0 md:pt-0">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'alerts'    && <AlertsTab />}
        {activeTab === 'quick'     && <QuickActionsTab />}
        {activeTab === 'links'     && <LinkCheckerTab />}

        {activeTab === 'settings'  && <SettingsTab />}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
                      bg-[#050a14]/90 backdrop-blur-xl
                      border-t border-[#00f0ff]/10
                      flex items-center justify-around
                      px-2 py-2 safe-area-bottom">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                        transition-all duration-200 min-w-[56px]
                        ${activeTab === id
                          ? 'text-[#00f0ff]'
                          : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`relative p-1.5 rounded-lg transition-all duration-200
                            ${activeTab === id
                              ? 'bg-[#00f0ff]/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                              : ''}`}>
              <Icon className="w-5 h-5" />
              {id === 'alerts' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full
                                 shadow-[0_0_6px_#ef4444]"></span>
              )}
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase
                             ${activeTab === id ? 'text-[#00f0ff]' : 'text-gray-600'}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>

    </div>
  );
}

export default App;