import React from "react";
import {
  Activity,
  Database,
  AlertTriangle,
  Shield,
  ShieldOff,
} from "lucide-react";
import VoicePanel from "./VoicePanel";
import heroBg from "../assets/hero.png";

/* ── Desktop ring animation (unchanged from original) ── */
const RingAnimation = () => (
  <svg
    viewBox="0 0 200 200"
    width="200"
    height="200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`
      @keyframes spinCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
      @keyframes spinCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
      .r1{transform-origin:100px 100px;animation:spinCW  12s linear infinite}
      .r2{transform-origin:100px 100px;animation:spinCCW  8s linear infinite}
      .r3{transform-origin:100px 100px;animation:spinCW   5s linear infinite}
    `}</style>
    <circle
      className="r1"
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="rgba(0,240,255,0.25)"
      strokeWidth="1.5"
      strokeDasharray="12 6"
    />
    <circle
      className="r2"
      cx="100"
      cy="100"
      r="70"
      fill="none"
      stroke="rgba(0,240,255,0.45)"
      strokeWidth="2"
      strokeDasharray="8 4"
    />
    <circle
      className="r3"
      cx="100"
      cy="100"
      r="50"
      fill="none"
      stroke="#00f0ff"
      strokeWidth="1.5"
      strokeDasharray="4 8"
    />
    <circle
      cx="100"
      cy="100"
      r="28"
      fill="rgba(0,240,255,0.04)"
      stroke="rgba(0,240,255,0.2)"
      strokeWidth="1"
    />
    <text
      x="100"
      y="97"
      textAnchor="middle"
      fill="rgba(0,240,255,0.6)"
      fontSize="8"
      fontFamily="monospace"
    >
      IIDPS
    </text>
    <text
      x="100"
      y="110"
      textAnchor="middle"
      fill="rgba(0,240,255,0.6)"
      fontSize="8"
      fontFamily="monospace"
    >
      NEXUS
    </text>
  </svg>
);

const DashboardTab = () => {
  const mockAlerts = [
    {
      type: "Port Scan detected",
      source: "192.168.1.50",
      action: "Blocked",
      time: "2m ago",
      color: "red",
    },
    {
      type: "Brute Force on SSH",
      source: "45.67.89.12",
      action: "Blocked",
      time: "5m ago",
      color: "orange",
    },
    {
      type: "DoS attack detected",
      source: "203.45.6.78",
      action: "Mitigated",
      time: "8m ago",
      color: "yellow",
    },
  ];

  return (
    <>
      {/* ═══════════════════════════════════
              MOBILE  ( < md )
         ═══════════════════════════════════ */}
      <div className="md:hidden">
        {/* Full-viewport hero — escapes px-4 via 100vw + negative margin */}
        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "100svh",
            marginLeft: "-1rem",
            marginTop: "-0.5rem",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={heroBg}
            alt="IIDPS shield"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          {/* dark gradient bottom-up */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #050a14 0%, rgba(5,10,20,0.5) 45%, transparent 100%)",
            }}
          />
          {/* centred text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 1.5rem",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.18em",
                textShadow:
                  "0 0 30px rgba(0,240,255,0.6), 0 2px 10px rgba(0,0,0,0.9)",
              }}
            >
              IIDPS NEXUS
            </h1>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#00f0ff",
                letterSpacing: "0.26em",
                textShadow: "0 0 14px rgba(0,240,255,0.9)",
              }}
            >
              Intelligent Protection Active
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "1.1rem",
                padding: "5px 16px",
                background: "rgba(0,255,0,0.1)",
                border: "1px solid rgba(0,255,0,0.45)",
                borderRadius: "999px",
                color: "#00ff00",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textShadow: "0 0 10px rgba(0,255,0,0.6)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00ff00",
                  boxShadow: "0 0 8px #00ff00",
                }}
              />
              SECURE
            </div>
          </div>
        </div>

        {/* Sections below hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingTop: "1rem",
          }}
        >
          <VoicePanel />
          <div className="glass-panel">
            <h2 className="section-header" style={{ marginBottom: "0.75rem" }}>
              Network Telemetry
            </h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "0.5rem",
                fontSize: "0.72rem",
                fontFamily: "monospace",
              }}
            >
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                TCP: 65%
              </span>
              <span style={{ color: "#00f0ff", fontWeight: 700 }}>
                UDP: 30%
              </span>
              <span style={{ color: "#9ca3af", fontWeight: 700 }}>
                ICMP: 5%
              </span>
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              Avg Packet Size:{" "}
              <span style={{ color: "#e2e8f0" }}>842 bytes</span>
            </div>
            <div
              className="line-chart-bg"
              style={{
                height: 112,
                borderRadius: 8,
                position: "relative",
                marginTop: 8,
              }}
            >
              <svg
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                }}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40 L100,100 Z"
                  fill="rgba(0,240,255,0.15)"
                />
                <path
                  d="M0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* ── END MOBILE ── */}

      {/* ═══════════════════════════════════
              DESKTOP  ( md+ )  — UNCHANGED
         ═══════════════════════════════════ */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT – 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card: original design with Shield icon + CSS, NO imported image */}
          <div className="hero-card rounded-xl p-8 flex flex-col justify-end">
            <div className="absolute inset-0 z-0 flex justify-center items-center opacity-30 pointer-events-none">
              <Shield className="w-48 h-48 text-[#00f0ff]" />
            </div>
            <div className="relative z-10 mt-auto">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider mb-2 drop-shadow-md">
                IIDPS NEXUS
              </h1>
              <p className="text-lg text-gray-300 font-medium mb-4">
                Intelligent Protection Active
              </p>
              <div className="status-badge flex items-center gap-2 font-bold tracking-widest text-sm">
                <span className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse"></span>
                SECURE
              </div>
            </div>
          </div>

          {/* Metrics 2×2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Packets/s
                </span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black font-mono text-blue-400">
                14,230
              </div>
            </div>
            <div className="glass-panel p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Bytes/s
                </span>
                <Database className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#00f0ff]">
                4.2 MB
              </div>
            </div>
            <div className="glass-panel p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Active Threats
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black font-mono text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                3
              </div>
            </div>
            <div className="glass-panel p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Blocked IPs
                </span>
                <ShieldOff className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black font-mono text-orange-500">
                15
              </div>
            </div>
          </div>

          {/* Network Telemetry */}
          <div className="glass-panel">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Network Telemetry
            </h2>
            <div className="flex gap-4 mb-4 text-xs font-mono">
              <span className="text-blue-400 font-bold">TCP: 65%</span>
              <span className="text-[#00f0ff] font-bold">UDP: 30%</span>
              <span className="text-gray-400 font-bold">ICMP: 5%</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Avg Packet Size: <span className="text-gray-200">842 bytes</span>
            </div>
            <div className="h-32 w-full rounded-lg line-chart-bg relative mt-4">
              <svg
                className="w-full h-full absolute bottom-0"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40 L100,100 Z"
                  fill="rgba(0,240,255,0.15)"
                />
                <path
                  d="M0,70 Q10,60 20,80 T40,50 T60,60 T80,30 T100,40"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT – 3 cols */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <VoicePanel />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel flex flex-col items-center">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full border-b border-white/5 pb-2 text-left">
                Attack Distribution
              </h2>
              <div className="pie-chart my-2"></div>
              <div className="w-full grid grid-cols-2 gap-x-2 gap-y-3 text-xs font-mono mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#ff003c] rounded-full shadow-[0_0_5px_#ff003c]"></div>
                  DoS: 45%
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#ff9d00] rounded-full shadow-[0_0_5px_#ff9d00]"></div>
                  Port Scan: 30%
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#b000ff] rounded-full shadow-[0_0_5px_#b000ff]"></div>
                  Bruteforce: 20%
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00f0ff] rounded-full shadow-[0_0_5px_#00f0ff]"></div>
                  DDoS: 5%
                </div>
              </div>
            </div>
            <div className="glass-panel flex flex-col">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                <button className="flex justify-between items-center bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 p-4 rounded-xl transition-all hover:scale-[1.02]">
                  <span className="font-bold tracking-wide">
                    Enable Protection
                  </span>
                  <Shield className="w-5 h-5" />
                </button>
                <button className="flex justify-between items-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 p-4 rounded-xl transition-all hover:scale-[1.02]">
                  <span className="font-bold tracking-wide">Deep Scan</span>
                  <Activity className="w-5 h-5" />
                </button>
                <button className="flex justify-between items-center bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 border border-gray-500/30 p-4 rounded-xl transition-all hover:scale-[1.02]">
                  <span className="font-bold tracking-wide">
                    Generate Report
                  </span>
                  <Database className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Real-Time Threat Feed
              </h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {mockAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${alert.color === "red" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : alert.color === "orange" ? "bg-orange-500 shadow-[0_0_8px_#f97316]" : "bg-yellow-500 shadow-[0_0_8px_#eab308]"}`}
                    ></div>
                    <div className="font-medium text-sm text-gray-200">
                      {alert.type} from{" "}
                      <span className="font-mono text-gray-400">
                        {alert.source}
                      </span>{" "}
                      &rarr;
                      <span
                        className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${alert.action === "Blocked" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}
                      >
                        {alert.action}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono sm:ml-4">
                    {alert.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
