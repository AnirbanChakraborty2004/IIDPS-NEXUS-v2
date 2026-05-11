import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Shield, Mic, Mail, CheckCircle } from 'lucide-react';

const Toggle = ({ label, icon, checked, onChange }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-lg text-gray-400">{icon}</div>
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        checked ? 'bg-[#00f0ff]' : 'bg-gray-600'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  </div>
);

// savedSettings & onSave come from App.jsx — state lives there, not here
const SettingsTab = ({ savedSettings, onSave }) => {
  // Local draft — initialised from the persisted savedSettings prop
  const [draft, setDraft] = useState({ ...savedSettings });
  const [saved, setSaved] = useState(false);

  // If the user somehow gets fresh savedSettings (e.g. loaded from API),
  // sync the draft — but only on mount / when savedSettings reference changes
  useEffect(() => {
    setDraft({ ...savedSettings });
  }, [savedSettings]);

  const isDirty = Object.keys(draft).some(
    (k) => draft[k] !== savedSettings[k]
  );

  const update = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave({ ...draft }); // push up to App.jsx — survives tab switches
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="glass-panel max-w-2xl mx-auto w-full">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
        <Settings className="w-4 h-4" /> System Configuration
      </h2>

      <div className="space-y-2 mb-6">
        {/* Sensitivity slider */}
        <div className="py-3 border-b border-white/5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-200">
                Detection Sensitivity
              </span>
            </div>
            <span className="text-xs font-mono text-[#00f0ff]">
              {draft.sensitivity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={draft.sensitivity}
            onChange={(e) => update({ sensitivity: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
          />
        </div>

        <Toggle
          label="Auto-Block Malicious IPs"
          icon={<Shield className="w-5 h-5" />}
          checked={draft.autoBlock}
          onChange={() => update({ autoBlock: !draft.autoBlock })}
        />
        <Toggle
          label="J.A.R.V.I.S Voice Assistant"
          icon={<Mic className="w-5 h-5" />}
          checked={draft.voiceAssistant}
          onChange={() => update({ voiceAssistant: !draft.voiceAssistant })}
        />
        <Toggle
          label="Alert Sounds"
          icon={<Bell className="w-5 h-5" />}
          checked={draft.alertSound}
          onChange={() => update({ alertSound: !draft.alertSound })}
        />
        <Toggle
          label="Email Notifications"
          icon={<Mail className="w-5 h-5" />}
          checked={draft.emailNotif}
          onChange={() => update({ emailNotif: !draft.emailNotif })}
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <span
          className={`text-xs font-mono transition-opacity duration-300 ${
            isDirty ? 'text-yellow-400 opacity-100' : 'opacity-0'
          }`}
        >
          • Unsaved changes
        </span>

        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg border font-bold text-sm transition-all ${
            saved
              ? 'bg-green-500/20 border-green-400/50 text-green-400 shadow-[0_0_15px_rgba(0,255,100,0.2)]'
              : isDirty
              ? 'bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer'
              : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;