// src/app/(dashboard)/photos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, Trash2, X, ZoomIn, ChevronLeft, ChevronRight, CheckSquare, Square, Grid3X3, List } from 'lucide-react';
import { formatBytes, formatRelativeTime } from '@/lib/utils';
import type { FileRecord } from '@/types';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<FileRecord | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'passport' | 'others'>('all');

  const fetchPhotos = async () => {
    setLoading(true);
    const res = await fetch('/api/files?category=photos&limit=100');
    const data = await res.json();
    setPhotos(data.files || []);
    setLoading(false);
  };

  useEffect(() => { fetchPhotos(); }, []);

  const filtered = photos.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'passport') return p.path.includes('passport');
    return !p.path.includes('passport');
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openLightbox = (file: FileRecord, index: number) => {
    setLightbox(file);
    setLightboxIndex(index);
  };

  const navigateLightbox = (dir: 'prev' | 'next') => {
    const imageFiles = filtered.filter(f => ['jpg', 'jpeg', 'png', 'webp'].includes(f.extension));
    const newIdx = dir === 'prev'
      ? (lightboxIndex - 1 + imageFiles.length) % imageFiles.length
      : (lightboxIndex + 1) % imageFiles.length;
    setLightbox(imageFiles[newIdx]);
    setLightboxIndex(newIdx);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} photo(s)?`)) return;
    await fetch('/api/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setSelected(new Set());
    fetchPhotos();
  };

  const isImageFile = (f: FileRecord) => ['jpg', 'jpeg', 'png', 'webp'].includes(f.extension);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-pink-400" /> Photos
        </h1>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => selected.forEach(id => window.open(`/api/download?id=${id}`, '_blank'))}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
              Download {selected.size}
            </button>
            <button
              onClick={() => handleDelete(Array.from(selected))}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              Delete {selected.size}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {[['all', 'All Photos'], ['passport', 'Passport Size'], ['others', 'Other Photos']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === key ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === key ? '#f472b6' : 'rgba(255,255,255,0.5)',
              border: activeTab === key ? '1px solid rgba(236,72,153,0.3)' : '1px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No photos found</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Add images to public/uploads/photos/ and scan from dashboard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="relative group rounded-xl overflow-hidden cursor-pointer aspect-square"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: selected.has(file.id) ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Image or placeholder */}
              {isImageFile(file) ? (
                <img
                  src={`/uploads/${file.path}`}
                  alt={file.displayName}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder-photo.png'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.65)' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {isImageFile(file) && (
                    <button
                      onClick={() => openLightbox(file, filtered.filter(isImageFile).indexOf(file))}
                      className="p-2 rounded-full transition-colors"
                      style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button onClick={() => window.open(`/api/download?id=${file.id}`, '_blank')}
                    className="p-2 rounded-full transition-colors"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs text-white truncate">{file.displayName}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatBytes(file.size)}</p>
                </div>
              </div>

              {/* Select checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                className="absolute top-2 left-2 transition-opacity"
                style={{ opacity: selected.has(file.id) ? 1 : 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                {selected.has(file.id)
                  ? <CheckSquare className="w-5 h-5 text-pink-400 drop-shadow" />
                  : <Square className="w-5 h-5 text-white drop-shadow" />}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.95)' }}
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={() => setLightbox(null)}>
              <X className="w-5 h-5" />
            </button>
            <button className="absolute left-4 p-3 rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={e => { e.stopPropagation(); navigateLightbox('prev'); }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <motion.img
              key={lightbox.id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={`/uploads/${lightbox.path}`}
              alt={lightbox.displayName}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button className="absolute right-4 p-3 rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={e => { e.stopPropagation(); navigateLightbox('next'); }}>
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 text-center">
              <p className="text-sm text-white font-medium">{lightbox.displayName}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatBytes(lightbox.size)}</p>
              <button onClick={e => { e.stopPropagation(); window.open(`/api/download?id=${lightbox.id}`, '_blank'); }}
                className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                Download Original
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
