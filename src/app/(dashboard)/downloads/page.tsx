// src/app/(dashboard)/downloads/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Clock } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDownloads = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity?action=DOWNLOAD&page=${p}&limit=30`);
      const data = await res.json();
      setDownloads(data.logs || []);
      setTotal(data.total || 0);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchDownloads(page); }, [page]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-green-400" /> Download History
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{total} total downloads</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-16">
          <Download className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No downloads yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {downloads.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Download className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{log.description}</p>
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <Clock className="w-3 h-3" /> {formatDate(log.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 30 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
            Previous
          </button>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Page {page} of {Math.ceil(total / 30)}
          </span>
          <button disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
