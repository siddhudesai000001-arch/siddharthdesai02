// src/lib/utils.ts
import path from 'path';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function toDisplayName(filename: string): string {
  const name = path.basename(filename, path.extname(filename));
  return name
    .replace(/_/g, ' ')
    .replace(/(\d{4})/g, ' ($1) ')
    .replace(/\b(ssc|hsc|bsc|mca|sem)\b/gi, (m) => m.toUpperCase())
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
    .replace(/\s+/g, ' ');
}

export function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

export function isImageFile(ext: string): boolean {
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase());
}

export function isPdfFile(ext: string): boolean {
  return ext.toLowerCase() === 'pdf';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ssc: 'SSC',
    hsc: 'HSC',
    bsc_cs: 'BSc CS',
    mca: 'MCA',
    others: 'Others',
    photos: 'Photos',
    documents: 'Documents',
  };
  return labels[category] || category.toUpperCase();
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ssc: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    hsc: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bsc_cs: 'bg-green-500/20 text-green-400 border-green-500/30',
    mca: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    others: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    photos: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
}

export function getFileIcon(ext: string): string {
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'file-text';
  if (['doc', 'docx'].includes(ext)) return 'file-text';
  if (ext === 'txt') return 'file';
  return 'file';
}

// Masks sensitive patterns for privacy mode
export function maskSensitiveText(text: string): string {
  return text
    // Aadhaar (12 digits)
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '•••• •••• ••••')
    // PAN (5 letters + 4 digits + 1 letter)
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, '•••••••••••')
    // Phone numbers
    .replace(/\b(\+91[\-\s]?)?[6-9]\d{9}\b/g, '•••••••••••')
    // Address patterns
    .replace(/\b\d{1,4}[,\s]+[A-Za-z\s]+(?:Colony|Nagar|Society|Road|Street|Lane|Area|Plot)\b/gi, '[Address Hidden]');
}
