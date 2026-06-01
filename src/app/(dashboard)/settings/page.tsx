// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Settings, Sun, Moon, Shield, Eye, EyeOff, Grid3X3, List, Save, CheckCircle2 } from 'lucide-react';

const SETTING_KEY = 'sidlocker_settings';

interface AppSettings {
  privacyMode: boolean;
  defaultView: 'grid' | 'list';
  watermarkEnabled: boolean;
  exportFormat: 'zip' | 'pdf';
}

const DEFAULT_SETTINGS: AppSettings = {
  privacyMode: true,
  defaultView: 'list',
  watermarkEnabled: true,
  exportFormat: 'zip',
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTING_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch { }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-white">{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5.5 rounded-full transition-all flex-shrink-0"
        style={{
          background: value ? '#3b82f6' : 'rgba(255,255,255,0.15)',
          width: '40px',
          height: '22px',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
          style={{ transform: value ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" /> Settings
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: saved ? '#4ade80' : 'white',
            border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Settings</>}
        </motion.button>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <div>
          <p className="text-sm text-white mb-2">Theme</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: theme === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                color: theme === 'dark' ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                border: theme === 'dark' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: theme === 'light' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                color: theme === 'light' ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                border: theme === 'light' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-white mb-2">Default View</p>
          <div className="flex gap-2">
            {[['list', 'List View', List], ['grid', 'Grid View', Grid3X3]].map(([v, label, Icon]: any) => (
              <button key={v} onClick={() => updateSetting('defaultView', v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: settings.defaultView === v ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  color: settings.defaultView === v ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                  border: settings.defaultView === v ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security">
        <Toggle
          label="Privacy Mode"
          desc="Masks Aadhaar, PAN, phone, and address in document previews. Original files are never modified."
          value={settings.privacyMode}
          onChange={v => updateSetting('privacyMode', v)}
        />
        <Toggle
          label="Show Watermark in Preview"
          desc={`Displays "Private Document - Siddharth" watermark during file previews only.`}
          value={settings.watermarkEnabled}
          onChange={v => updateSetting('watermarkEnabled', v)}
        />
        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="text-blue-400 font-semibold">Note:</span> Downloaded files are always original and unmodified, regardless of privacy settings.
          </p>
        </div>
      </Section>

      {/* Export preferences */}
      <Section title="Export Preferences">
        <div>
          <p className="text-sm text-white mb-2">Default Export Format</p>
          <div className="flex gap-2">
            {[['zip', 'ZIP Archive'], ['pdf', 'PDF Merge']].map(([v, label]) => (
              <button key={v} onClick={() => updateSetting('exportFormat', v as any)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: settings.exportFormat === v ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                  color: settings.exportFormat === v ? '#c084fc' : 'rgba(255,255,255,0.6)',
                  border: settings.exportFormat === v ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About SidLocker">
        <div className="space-y-1.5">
          {[
            ['Version', '1.0.0'],
            ['Stack', 'Next.js 14 + TypeScript + Prisma + SQLite'],
            ['Storage', 'Local File System'],
            ['Auth', 'NextAuth.js + bcrypt'],
            ['Privacy', 'No cloud. No tracking. Fully private.'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
              <span className="text-xs font-medium text-white">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
