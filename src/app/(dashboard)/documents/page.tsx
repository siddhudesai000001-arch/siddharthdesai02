// src/app/(dashboard)/documents/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, FolderOpen, Download, Trash2, Pencil,
  Grid3X3, List, ChevronDown, ChevronRight, Search,
  CheckSquare, Square, Eye, MoreVertical, Tag, Info
} from 'lucide-react';
import { formatBytes, formatRelativeTime, getCategoryColor } from '@/lib/utils';
import type { FileRecord, FolderRecord } from '@/types';

const CATEGORIES = [
  { key: 'all', label: 'All Documents' },
  { key: 'ssc', label: 'SSC' },
  { key: 'hsc', label: 'HSC' },
  { key: 'bsc_cs', label: 'BSc CS' },
  { key: 'mca', label: 'MCA' },
  { key: 'others', label: 'Others' },
];

export default function DocumentsPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    params.set('limit', '100');
    const res = await fetch(`/api/files?${params}`);
    const data = await res.json();
    setFiles(data.files || []);
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const filtered = files.filter(f =>
    f.displayName.toLowerCase().includes(search.toLowerCase()) ||
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map(f => f.id)));
  const clearSelection = () => setSelected(new Set());

  const handleDownload = async (file: FileRecord) => {
    window.open(`/api/download?id=${file.id}`, '_blank');
  };

  const handleBulkDownload = async () => {
    for (const id of Array.from(selected)) {
      window.open(`/api/download?id=${id}`, '_blank');
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} file(s)? This cannot be undone.`)) return;
    await fetch('/api/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setSelected(new Set());
    fetchFiles();
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await fetch('/api/files', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, displayName: editName }),
    });
    setEditingId(null);
    fetchFiles();
  };

  const handleBulkExportZip = async () => {
    const ids = Array.from(selected);
    const res = await fetch('/api/export/zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: ids, options: { includeFolderStructure: true } }),
    });
    if (!res.ok) { alert('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sidlocker-export-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" /> Documents
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-blue-400 bg-blue-400/10' : ''}`} style={{ color: viewMode !== 'grid' ? 'rgba(255,255,255,0.4)' : undefined }}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'text-blue-400 bg-blue-400/10' : ''}`} style={{ color: viewMode !== 'list' ? 'rgba(255,255,255,0.4)' : undefined }}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setSelected(new Set()); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: activeCategory === key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === key ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              border: activeCategory === key ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Selection Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter files..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <span className="text-xs text-blue-400 font-medium">{selected.size} selected</span>
            <button onClick={handleBulkDownload} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Download</button>
            <button onClick={handleBulkExportZip} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">ZIP</button>
            <button onClick={() => handleDelete(Array.from(selected))} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
            <button onClick={clearSelection} className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
          </motion.div>
        )}

        <button onClick={filtered.length === selected.size ? clearSelection : selectAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
          {filtered.length === selected.size ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* File count */}
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {filtered.length} file{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Files */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No documents found</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Add files to public/uploads/ and click Scan Files on dashboard
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`file-card relative ${selected.has(file.id) ? 'selected' : ''}`}
              onClick={() => toggleSelect(file.id)}
            >
              <div className="absolute top-2 right-2">
                {selected.has(file.id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)' }}>
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-white truncate pr-6">{file.displayName}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {formatBytes(file.size)} • .{file.extension}
              </p>
              <div className="flex gap-1 mt-3">
                <button onClick={e => { e.stopPropagation(); handleDownload(file); }}
                  className="flex-1 text-xs py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* List header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-medium"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="col-span-1"></div>
            <div className="col-span-5">Name</div>
            <div className="col-span-2 hidden sm:block">Category</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-2 hidden md:block">Uploaded</div>
          </div>
          {filtered.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all items-center ${selected.has(file.id) ? 'bg-blue-500/10 border border-blue-500/30' : ''}`}
              style={{ background: selected.has(file.id) ? undefined : 'rgba(255,255,255,0.03)' }}
              onClick={() => toggleSelect(file.id)}
            >
              <div className="col-span-1">
                {selected.has(file.id)
                  ? <CheckSquare className="w-4 h-4 text-blue-400" />
                  : <Square className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 flex-shrink-0 text-blue-400" />
                {editingId === file.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(file.id); if (e.key === 'Escape') setEditingId(null); }}
                    onBlur={() => handleRename(file.id)}
                    onClick={e => e.stopPropagation()}
                    className="input-field py-0.5 text-xs flex-1"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-medium text-white truncate">{file.displayName}</span>
                )}
              </div>
              <div className="col-span-2 hidden sm:block">
                <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(file.category)}`}>
                  {file.category.toUpperCase()}
                </span>
              </div>
              <div className="col-span-2 hidden sm:block text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {formatBytes(file.size)}
              </div>
              <div className="col-span-2 hidden md:block text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {formatRelativeTime(file.uploadedAt)}
              </div>

              {/* Actions - stop propagation */}
              <div className="col-span-12 sm:col-span-0 flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleDownload(file)} title="Download"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setEditingId(file.id); setEditName(file.displayName); }} title="Rename"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fbbf24'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete([file.id])} title="Delete"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
