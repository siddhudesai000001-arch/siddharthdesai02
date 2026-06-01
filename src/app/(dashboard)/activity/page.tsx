// src/app/(dashboard)/activity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, LogIn, Upload, Download, Package,
  Trash2, Pencil, Search, Shield, Clock, Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ACTION_ICONS: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogIn,
  UPLOAD: Upload,
  DOWNLOAD: Download,
  EXPORT: Package,
  DELETE: Trash2,
  RENAME: Pencil,
  MOVE: Pencil,
  COPY: Pencil,
  SEARCH: Search,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: '#60a5fa',
  LOGOUT: '#94a3b8',
  UPLOAD: '#34d399',
  DOWNLOAD: '#a78bfa',
  EXPORT: '#f472b6',
  DELETE: '#f87171',
  RENAME: '#fbbf24',
  MOVE: '#fbbf24',
  COPY: '#fbbf24',
  SEARCH: '#60a5fa',
};

const FILTER_ACTIONS = ['ALL', 'LOGIN', 'UPLOAD', 'DOWNLOAD', 'EXPORT', 'DELETE', 'SEARCH'];

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async (p = 1, action = 'ALL') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: '30' });
      if (action !== 'ALL') params.set('action', action);
      const res = await fetch(`/api/activity?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(page, actionFilter); }, [page, actionFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" /> Activity Logs
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{total} total events</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTER_ACTIONS.map(action => (
          <button
            key={action}
            onClick={() => { setActionFilter(action); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: actionFilter === action ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: actionFilter === action ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              border: actionFilter === action ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Log list */}
      {loading ? (
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, i) => {
            const Icon = ACTION_ICONS[log.action] || Activity;
            const color = ACTION_COLORS[log.action] || '#94a3b8';
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}18`, color }}>
                      {log.action}
                    </span>
                    <p className="text-sm text-white truncate">{log.description}</p>
                  </div>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <Clock className="w-3 h-3" /> {formatDate(log.createdAt)}
                    {log.ipAddress && <span className="ml-2">• {log.ipAddress}</span>}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 30 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
            Previous
          </button>
          <span className="text-sm px-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {page} / {Math.ceil(total / 30)}
          </span>
          <button disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
