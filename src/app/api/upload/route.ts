// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { toDisplayName, getMimeType } from '@/lib/utils';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'txt'];
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const CATEGORY_TO_PATH: Record<string, string> = {
  ssc: 'documents/ssc',
  hsc: 'documents/hsc',
  bsc_cs: 'documents/bsc_cs',
  mca: 'documents/mca',
  others: 'documents/others',
  'photos/passport_size': 'photos/passport_size',
  'photos/others': 'photos/others',
  photos: 'photos/others',
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string || 'others';
    const folderId = formData.get('folderId') as string || null;
    const subFolder = formData.get('subFolder') as string || '';

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push({ filename: file.name, error: `Extension .${ext} not allowed` });
        continue;
      }

      if (file.size > MAX_SIZE_BYTES) {
        errors.push({ filename: file.name, error: `File too large (max ${MAX_SIZE_MB}MB)` });
        continue;
      }

      try {
        // Determine storage path
        const categoryPath = CATEGORY_TO_PATH[category] || 'documents/others';
        const storageDir = path.join(process.cwd(), 'public', 'uploads', categoryPath);

        await mkdir(storageDir, { recursive: true });

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = path.join(storageDir, filename);
        await writeFile(filePath, buffer);

        const relativePath = `${categoryPath}/${filename}`;
        const virtualPath = categoryPath
          .split('/')
          .map((p) => p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
          .join(' > ');

        // Find folder record
        let folderRecord = null;
        if (folderId) {
          folderRecord = await prisma.folder.findUnique({ where: { id: folderId } });
        } else {
          folderRecord = await prisma.folder.findFirst({ where: { path: categoryPath } });
        }

        // Save to DB
        const fileRecord = await prisma.file.create({
          data: {
            filename,
            displayName: toDisplayName(file.name),
            originalName: file.name,
            extension: ext,
            mimeType: getMimeType(ext),
            size: file.size,
            path: relativePath,
            virtualPath,
            category: category.split('/')[0],
            folderId: folderRecord?.id || null,
            userId,
          },
        });

        // Log upload
        await prisma.uploadHistory.create({
          data: { userId, filename, fileSize: file.size, category, status: 'success' },
        });

        await prisma.activityLog.create({
          data: {
            userId,
            action: 'UPLOAD',
            description: `Uploaded file: ${file.name} to ${virtualPath}`,
            metadata: JSON.stringify({ fileId: fileRecord.id, category, size: file.size }),
          },
        });

        results.push(fileRecord);
      } catch (err: any) {
        errors.push({ filename: file.name, error: err.message });
        await prisma.uploadHistory.create({
          data: { userId, filename: file.name, fileSize: file.size, category, status: 'failed' },
        });
      }
    }

    return NextResponse.json({
      success: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
