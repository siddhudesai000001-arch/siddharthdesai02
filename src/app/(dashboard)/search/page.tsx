// src/app/(dashboard)/search/page.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, FileText, FolderOpen, Download, X, SlidersHorizontal } from 'lucide-react';
import { formatBytes, formatRelativeTime, getCategoryColor } from '@/lib/utils';
import type { FileRecord, FolderRecord } from '@/types';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['ssc', 'hsc', 'bsc_cs', 'mca', 'others', 'photos'];
const EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'txt'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [extension, setExtension] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<{ files: FileRecord[]; folders: FolderRecord[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const doSearch = useCallback(async (q: string, cat: string, ext: string, from: string, to: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    if (ext) params.set('extension', ext);
    if (from) params.set('dateFrom', from);
    if (to) params.set('dateTo', to);

    if (!q && !cat && !ext && !from && !to) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data);
    } catch { }
    setLoading(false);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(val, category, extension, dateFrom, dateTo);
    }, 300);
  };

  const handleFilterChange = (cat: string, ext: string, from: string, to: string) => {
    setCategory(cat); setExtension(ext); setDateFrom(from); setDateTo(to);
    doSearch(query, cat, ext, from, to);
  };

  const clearAll = () => {
    setQuery(''); setCategory(''); setExtension(''); setDateFrom(''); setDateTo('');
    setResults(null);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Search className="w-6 h-6 text-blue-400" /> Search
      </h1>

      {/* Search bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search by file name, description, tags..."
            className="input-field pl-10 pr-10 py-3 text-sm"
            autoFocus
          />
          {query && (
            <button onClick={clearAll} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: showFilters ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Advanced Filters
            {(category || extension || dateFrom || dateTo) && (
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                Active
              </span>
            )}
          </button>
          {results && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {results.total} result{results.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Category</label>
                <select value={category} onChange={e => handleFilterChange(e.target.value, extension, dateFrom, dateTo)}
                  className="input-field text-xs py-2">
                  <option value="">All</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>File Type</label>
                <select value={extension} onChange={e => handleFilterChange(category, e.target.value, dateFrom, dateTo)}
                  className="input-field text-xs py-2">
                  <option value="">All</option>
                  {EXTENSIONS.map(e => <option key={e} value={e}>.{e.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>From Date</label>
                <input type="date" value={dateFrom} onChange={e => handleFilterChange(category, extension, e.target.value, dateTo)}
                  className="input-field text-xs py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>To Date</label>
                <input type="date" value={dateTo} onChange={e => handleFilterChange(category, extension, dateFrom, e.target.value)}
                  className="input-field text-xs py-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : results === null ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Start typing to search your documents</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Search by file name, tags, or use filters for advanced search
          </p>
        </div>
      ) : results.total === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No results found</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Try different keywords or adjust filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folders */}
          {results.folders.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Folders ({results.folders.length})
              </p>
              <div className="space-y-1">
                {results.folders.map(folder => (
                  <div key={folder.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <FolderOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{folder.displayName}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{folder.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {results.files.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Files ({results.files.length})
              </p>
              <div className="space-y-1">
                {results.files.map((file, i) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.displayName}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {file.virtualPath} • {formatBytes(file.size)} • {formatRelativeTime(file.uploadedAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${getCategoryColor(file.category)}`}>
                      {file.category.toUpperCase()}
                    </span>
                    <button
                      onClick={() => window.open(`/api/download?id=${file.id}`, '_blank')}
                      className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
