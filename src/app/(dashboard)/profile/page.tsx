// src/app/(dashboard)/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, HardDrive, FileText, Download, Clock, Shield } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/files/stats').then(r => r.json()).then(setStats);
  }, []);

  const INFO_CARDS = [
    { icon: FileText, label: 'Total Documents', value: stats?.totalDocuments ?? '—', color: '#3b82f6' },
    { icon: FileText, label: 'Total Photos', value: stats?.totalPhotos ?? '—', color: '#ec4899' },
    { icon: HardDrive, label: 'Storage Used', value: stats ? formatBytes(stats.storageUsed) : '—', color: '#10b981' },
    { icon: Download, label: 'Total Downloads', value: stats?.recentDownloads?.length ?? '—', color: '#a78bfa' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <User className="w-6 h-6 text-blue-400" /> Profile
      </h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(59,130,246,0.3)' }}>
            <span className="text-2xl font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{session?.user?.name || 'Siddharth'}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {session?.user?.email}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400">Private Access Only</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {INFO_CARDS.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last login */}
      {stats?.lastLogin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card p-4 flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Last Login</p>
            <p className="text-sm font-medium text-white">{formatDate(stats.lastLogin)}</p>
          </div>
        </motion.div>
      )}

      {/* Security info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="glass-card p-4"
        style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' }}>
        <p className="text-xs font-semibold text-green-400 mb-2">Security Information</p>
        <ul className="space-y-1.5">
          {[
            'Credentials stored in .env file only',
            'Password hashed with bcrypt (12 rounds)',
            'Session managed by NextAuth.js',
            'All files stored locally — no cloud',
            'Sensitive data never indexed in search',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Shield className="w-3 h-3 text-green-400 flex-shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
