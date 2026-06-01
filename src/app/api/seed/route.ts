// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { readdirSync, statSync, existsSync } from 'fs';
import path from 'path';
import { toDisplayName, getMimeType } from '@/lib/utils';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'txt'];

function scanDir(dir: string, relBase: string): Array<{ filename: string; relativePath: string; size: number; ext: string }> {
  const results: any[] = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, relPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).replace('.', '').toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const stats = statSync(fullPath);
        results.push({ filename: entry.name, relativePath: relPath, size: stats.size, ext });
      }
    }
  }
  return results;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = scanDir(uploadsDir, '');

  let added = 0;
  let skipped = 0;

  for (const fileInfo of files) {
    const existing = await prisma.file.findFirst({ where: { path: fileInfo.relativePath } });
    if (existing) { skipped++; continue; }

    const pathParts = fileInfo.relativePath.split('/');
    pathParts.pop();
    const folderRelPath = pathParts.join('/');
    const category = pathParts[0] === 'photos' ? 'photos' : pathParts[1] || 'others';
    const virtualPath = folderRelPath.split('/').map((p: string) => p.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())).join(' > ');

    const folder = await prisma.folder.findFirst({
      where: { path: { contains: folderRelPath } },
    });

    await prisma.file.create({
      data: {
        filename: fileInfo.filename,
        displayName: toDisplayName(fileInfo.filename),
        originalName: fileInfo.filename,
        extension: fileInfo.ext,
        mimeType: getMimeType(fileInfo.ext),
        size: fileInfo.size,
        path: fileInfo.relativePath,
        virtualPath: virtualPath || 'Uploads',
        category,
        folderId: folder?.id || null,
        userId,
      },
    });
    added++;
  }

  return NextResponse.json({ success: true, added, skipped, total: files.length });
}
