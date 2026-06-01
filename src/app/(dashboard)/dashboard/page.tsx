// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Image, FolderOpen, HardDrive, Upload,
  Download, Clock, TrendingUp, RefreshCw, Shield
} from 'lucide-react';
import { formatBytes, formatRelativeTime, formatDate, getCategoryColor } from '@/lib/utils';
import Link from 'next/link';

interface Stats {
  totalDocuments: number;
  totalPhotos: number;
  totalFolders: number;
  storageUsed: number;
  recentUploads: any[];
  lastLogin: string | null;
  recentDownloads: any[];
}

const STAT_CARDS = [
  { key: 'totalDocuments', label: 'Total Documents', icon: FileText, color: '#3b82f6', href: '/documents' },
  { key: 'totalPhotos', label: 'Total Photos', icon: Image, color: '#ec4899', href: '/photos' },
  { key: 'totalFolders', label: 'Total Folders', icon: FolderOpen, color: '#f59e0b', href: '/documents' },
  { key: 'storageUsed', label: 'Storage Used', icon: HardDrive, color: '#10b981', format: 'bytes', href: '#' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files/stats');
      const data = await res.json();
      setStats(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSeedFiles = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      alert(`✅ Scan complete! Added: ${data.added}, Skipped (already exists): ${data.skipped}`);
      fetchStats();
    } catch {
      alert('Seed failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            Dashboard
          </motion.h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {stats?.lastLogin
              ? `Last login: ${formatRelativeTime(stats.lastLogin)}`
              : 'Welcome to SidLocker'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeedFiles}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Scan Files
          </button>
          <Link href="/upload">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white' }}>
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, format, href }, i) => {
          const value = stats?.[key as keyof Stats] as number;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={href}>
                <div className="glass-card p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {loading
                          ? <span className="inline-block w-12 h-6 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                          : format === 'bytes'
                            ? formatBytes(value || 0)
                            : (value || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Recent Uploads
            </h2>
            <Link href="/documents">
              <span className="text-xs" style={{ color: '#60a5fa' }}>View all</span>
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))
            ) : stats?.recentUploads?.length ? (
              stats.recentUploads.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{file.displayName}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatBytes(file.size)} • {formatRelativeTime(file.uploadedAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(file.category)}`}>
                    {file.category.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No uploads yet</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Add files to public/uploads/ and click "Scan Files"
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-green-400" />
              Recent Downloads
            </h2>
            <Link href="/downloads">
              <span className="text-xs" style={{ color: '#60a5fa' }}>View all</span>
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))
            ) : stats?.recentDownloads?.length ? (
              stats.recentDownloads.map((dl) => (
                <div key={dl.id} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <Download className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{dl.filename}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatRelativeTime(dl.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Download className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No downloads yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}
      >
        <Shield className="w-4 h-4 flex-shrink-0 text-green-400" />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span className="text-green-400 font-semibold">Private & Secure</span> — All files stored locally. 
          No cloud. No external services. Credentials in .env file only.
        </p>
      </motion.div>
    </div>
  );
}
