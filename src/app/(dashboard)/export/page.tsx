// src/app/(dashboard)/export/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Download, Archive, FileText, CheckSquare,
  Square, AlertCircle, CheckCircle2, Loader2, Settings2
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import type { FileRecord, ExportOptions } from '@/types';

const CATEGORIES = [
  { value: 'all', label: 'Everything' },
  { value: 'ssc', label: 'SSC' },
  { value: 'hsc', label: 'HSC' },
  { value: 'bsc_cs', label: 'BSc CS' },
  { value: 'mca', label: 'MCA' },
  { value: 'photos', label: 'Photos' },
  { value: 'others', label: 'Others' },
];

const defaultOptions: ExportOptions = {
  includeFolderStructure: true,
  includeMetadata: true,
  includeUploadDates: true,
  includeFileNames: true,
  compressFiles: true,
  passwordProtect: false,
  includeCoverPage: false,
};

export default function ExportPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [showOptions, setShowOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      const params = new URLSearchParams({ limit: '200' });
      if (activeCategory !== 'all') params.set('category', activeCategory);
      const res = await fetch(`/api/files?${params}`);
      const data = await res.json();
      setFiles(data.files || []);
      setSelected(new Set());
      setLoading(false);
    };
    fetchFiles();
  }, [activeCategory]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(files.map(f => f.id)));
  const clearSelection = () => setSelected(new Set());

  const totalSize = files
    .filter(f => selected.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  const handleExportZip = async () => {
    if (selected.size === 0 && files.length === 0) {
      alert('No files to export');
      return;
    }
    setExporting(true);
    setExportStatus('idle');
    try {
      const fileIds = selected.size > 0 ? Array.from(selected) : undefined;
      const body: any = { options };
      if (fileIds) body.fileIds = fileIds;
      else if (activeCategory !== 'all') body.category = activeCategory;
      else body.exportAll = true;

      const res = await fetch('/api/export/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sidlocker-export-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('success');
    } catch {
      setExportStatus('error');
    }
    setExporting(false);
  };

  const optionKeys = Object.keys(defaultOptions) as (keyof ExportOptions)[];
  const optionLabels: Record<keyof ExportOptions, string> = {
    includeFolderStructure: 'Include Folder Structure',
    includeMetadata: 'Include Metadata',
    includeUploadDates: 'Include Upload Dates',
    includeFileNames: 'Include File Names',
    compressFiles: 'Compress Files',
    passwordProtect: 'Password Protect PDF',
    includeCoverPage: 'Include Cover Page',
    password: 'Password',
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Package className="w-6 h-6 text-purple-400" /> Export Center
      </h1>

      {/* Category Filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map(({ value, label }) => (
          <button key={value} onClick={() => setActiveCategory(value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: activeCategory === value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === value ? '#c084fc' : 'rgba(255,255,255,0.5)',
              border: activeCategory === value ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Selection + Export Panel */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                Select All ({files.length})
              </button>
              {selected.size > 0 && (
                <button onClick={clearSelection} className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                  Clear
                </button>
              )}
            </div>
            {selected.size > 0 && (
              <span className="text-xs" style={{ color: '#c084fc' }}>
                {selected.size} selected • {formatBytes(totalSize)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: showOptions ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)',
                color: showOptions ? '#c084fc' : 'rgba(255,255,255,0.6)',
                border: showOptions ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
              }}>
              <Settings2 className="w-3.5 h-3.5" /> Export Settings
            </button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleExportZip}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: exporting ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
              }}
            >
              {exporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</>
              ) : (
                <><Archive className="w-4 h-4" />Export ZIP</>
              )}
            </motion.button>
          </div>
        </div>

        {/* Export status */}
        <AnimatePresence>
          {exportStatus === 'success' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Export successful! Your ZIP file has been downloaded.
            </motion.div>
          )}
          {exportStatus === 'error' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Export failed. Please try again.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 space-y-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Export Options
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(optionKeys.filter(k => k !== 'password') as (keyof ExportOptions)[]).map(key => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer group p-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div
                      className="w-4 h-4 rounded transition-all flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: options[key] ? '#8b5cf6' : 'transparent',
                        border: options[key] ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)',
                      }}
                      onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key as keyof ExportOptions] }))}
                    >
                      {options[key] && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {optionLabels[key]}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File list */}
      {loading ? (
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No files in this category</p>
        </div>
      ) : (
        <div className="space-y-1">
          {files.map((file, i) => (
            <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: selected.has(file.id) ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                border: selected.has(file.id) ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
              }}
              onClick={() => toggleSelect(file.id)}
            >
              {selected.has(file.id)
                ? <CheckSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                : <Square className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />}
              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.displayName}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {file.virtualPath} • {formatBytes(file.size)} • .{file.extension.toUpperCase()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
