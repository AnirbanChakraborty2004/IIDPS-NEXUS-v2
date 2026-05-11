import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardTab from './components/DashboardTab';
import AlertsTab from './components/AlertsTab';
import SettingsTab from './components/SettingsTab';
import QuickActionsTab from './components/QuickActionsTab';
import LinkCheckerTab from './components/LinkCheckerTab';
import { Shield, LayoutDashboard, Bell, BarChart2, Settings, Zap, Link2 } from 'lucide-react';
import { fetchDashboardData, WS_URL } from './services/api';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts',    label: 'Alerts',    icon: Bell },
  { id: 'quick',     label: 'Quick',     icon: Zap },
  { id: 'links',     label: 'Links',     icon: Link2 },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

const SETTINGS_DEFAULTS = {
  sensitivity: 80,
  autoBlock: true,
  voiceAssistant: true,
  alertSound: true,
  emailNotif: false,
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [uptime, setUptime] = useState('0h 0m');

  // Live data from backend
  const [stats, setStats] = useState({
    bandwidth_mbps: 0,
    active_connections: 0,
    threats_blocked: 0,
    defcon_level: 5,
  });
  const [alerts, setAlerts] = useState([]);
  const startTimeRef = useRef(Date.now());

  // Lifted settings state — survives tab switches
  const [savedSettings, setSavedSettings] = useState({ ...SETTINGS_DEFAULTS });

  // Uptime timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - startTimeRef.current;
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setUptime(`${hours}h ${mins}m`);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Poll backend for dashboard data every 3 seconds
  const pollData = useCallback(async () => {
    const data = await fetchDashboardData();
    if (data) {
      setStats(data.stats);
      setAlerts(data.recent_alerts || []);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, 3000);
    return () => clearInterval(interval);
  }, [pollData]);

  // WebSocket for real-time alerts
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WS] Connected to alert stream');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'NEW_ALERT' && message.data) {
            setAlerts(prev => [message.data, ...prev].slice(0, 20));
            // Re-poll to sync stats
            pollData();
          }
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in 5s...');
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [pollData]);

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
            Uptime: {uptime} | DEFCON {stats.defcon_level}
          </div>
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden flex w-full items-center justify-between px-6 pt-5 pb-3 relative z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#00f0ff] shrink-0" />
          <h1 className="text-sm font-bold header-title m-0 tracking-[0.2em] whitespace-nowrap">
            IIDPS NEXUS
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-[10px] text-gray-300 font-mono font-medium tracking-widest leading-none">
            {isConnected ? 'SECURE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full relative z-10
                       px-4 pb-24 md:pb-6 md:px-4 lg:px-8
                       pt-0 md:pt-0">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} alerts={alerts} />}
        {activeTab === 'alerts'    && <AlertsTab alerts={alerts} stats={stats} />}
        {activeTab === 'quick'     && <QuickActionsTab />}
        {activeTab === 'links'     && <LinkCheckerTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            savedSettings={savedSettings}
            onSave={(newSettings) => setSavedSettings(newSettings)}
          />
        )}
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
              {id === 'alerts' && alerts.length > 0 && (
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