// src/app/(dashboard)/upload/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, File, Folder } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

const CATEGORIES = [
  { value: 'ssc', label: 'SSC' },
  { value: 'hsc', label: 'HSC' },
  { value: 'bsc_cs', label: 'BSc CS' },
  { value: 'mca', label: 'MCA' },
  { value: 'photos/passport_size', label: 'Photos - Passport Size' },
  { value: 'photos/others', label: 'Photos - Others' },
  { value: 'others', label: 'Others' },
];

interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress: number;
}

export default function UploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [category, setCategory] = useState('others');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newItems: UploadItem[] = accepted.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      status: 'pending',
      progress: 0,
    }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUploadAll = async () => {
    const pending = items.filter(i => i.status === 'pending');
    if (!pending.length) return;

    setUploading(true);
    const formData = new FormData();
    pending.forEach(item => formData.append('files', item.file));
    formData.append('category', category);

    // Set uploading status
    setItems(prev => prev.map(i => i.status === 'pending' ? { ...i, status: 'uploading', progress: 50 } : i));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      setItems(prev => prev.map(item => {
        if (item.status !== 'uploading') return item;
        const errDetail = data.errorDetails?.find((e: any) => e.filename === item.file.name);
        if (errDetail) return { ...item, status: 'error', progress: 0, error: errDetail.error };
        return { ...item, status: 'success', progress: 100 };
      }));
    } catch (err) {
      setItems(prev => prev.map(i => i.status === 'uploading' ? { ...i, status: 'error', progress: 0, error: 'Upload failed' } : i));
    }
    setUploading(false);
  };

  const clearCompleted = () => setItems(prev => prev.filter(i => i.status !== 'success'));
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const successCount = items.filter(i => i.status === 'success').length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-400" /> Upload Center
      </h1>

      {/* Category selector */}
      <div className="glass-card p-4">
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Upload Destination
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input-field"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'dropzone-active' : ''}`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: isDragActive ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)',
        }}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: isDragActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)' }}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-400' : ''}`}
              style={{ color: isDragActive ? undefined : 'rgba(255,255,255,0.3)' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isDragActive ? 'Drop files here!' : 'Drag & drop files here'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              or click to browse • PDF, JPG, PNG, WEBP, DOC, DOCX, TXT • Max 50MB per file
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-medium text-white">
                {items.length} file{items.length !== 1 ? 's' : ''}
                {successCount > 0 && <span className="text-green-400 ml-2">({successCount} uploaded)</span>}
              </p>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <button onClick={clearCompleted} className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Clear completed
                  </button>
                )}
                <button onClick={() => setItems([])} className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Clear all
                </button>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <File className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{item.file.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatBytes(item.file.size)}
                    </p>
                    {item.status === 'uploading' && (
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          className="h-full rounded-full"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-red-400 mt-0.5">{item.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    {item.status === 'pending' && (
                      <button onClick={() => removeItem(item.id)} className="p-1 rounded" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pendingCount > 0 && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: uploading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: 'white',
                  }}
                >
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" />Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''} to {CATEGORIES.find(c => c.value === category)?.label}</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
