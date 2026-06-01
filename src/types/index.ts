// src/types/index.ts

export interface FileRecord {
  id: string;
  filename: string;
  displayName: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  virtualPath: string;
  category: string;
  folderId?: string | null;
  userId: string;
  uploadedAt: string | Date;
  updatedAt: string | Date;
  tags: string;
  description: string;
  isDeleted: boolean;
  folder?: FolderRecord | null;
}

export interface FolderRecord {
  id: string;
  name: string;
  displayName: string;
  path: string;
  parentId?: string | null;
  category: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  children?: FolderRecord[];
  files?: FileRecord[];
  _count?: { files: number };
}

export interface ActivityLogRecord {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata: string;
  ipAddress: string;
  createdAt: string | Date;
}

export interface DashboardStats {
  totalDocuments: number;
  totalPhotos: number;
  totalFolders: number;
  storageUsed: number;
  recentUploads: FileRecord[];
  lastLogin: string | Date | null;
  recentDownloads: DownloadRecord[];
}

export interface DownloadRecord {
  id: string;
  userId: string;
  fileId: string;
  filename: string;
  createdAt: string | Date;
  file?: FileRecord;
}

export type ViewMode = 'grid' | 'list' | 'tree';
export type ThemeMode = 'dark' | 'light';
export type ExportFormat = 'zip' | 'pdf' | 'merge-pdf';

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface SearchFilters {
  query: string;
  category?: string;
  extension?: string;
  dateFrom?: string;
  dateTo?: string;
  folder?: string;
}

export interface ExportOptions {
  includeFolderStructure: boolean;
  includeMetadata: boolean;
  includeUploadDates: boolean;
  includeFileNames: boolean;
  compressFiles: boolean;
  passwordProtect: boolean;
  includeCoverPage: boolean;
  password?: string;
}

export const CATEGORIES = {
  ssc: 'SSC',
  hsc: 'HSC',
  bsc_cs: 'BSc CS',
  mca: 'MCA',
  others: 'Others',
  photos: 'Photos',
} as const;

export const FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'txt'] as const;

export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'EXPORT'
  | 'DELETE'
  | 'RENAME'
  | 'MOVE'
  | 'COPY'
  | 'SEARCH';
