// src/app/api/export/zip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import archiver from 'archiver';
import path from 'path';
import { existsSync } from 'fs';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { fileIds, category, exportAll, options } = body;

  // Build query
  const where: any = { userId, isDeleted: false };
  if (fileIds?.length) where.id = { in: fileIds };
  else if (category) where.category = category;

  const files = await prisma.file.findMany({ where, include: { folder: true } });
  if (!files.length) return NextResponse.json({ error: 'No files found' }, { status: 404 });

  // Create ZIP in memory
  const passThrough = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(passThrough);

  for (const file of files) {
    const filePath = path.join(process.cwd(), 'public', 'uploads', file.path);
    if (existsSync(filePath)) {
      const archivePath = options?.includeFolderStructure
        ? `${file.virtualPath.replace(/ > /g, '/')}/${file.filename}`
        : file.filename;
      archive.file(filePath, { name: archivePath });
    }
  }

  await archive.finalize();

  // Collect chunks
  const chunks: Buffer[] = [];
  for await (const chunk of passThrough) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const zipBuffer = Buffer.concat(chunks);

  // Log export
  await prisma.exportHistory.create({
    data: {
      userId,
      exportType: 'zip',
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      status: 'success',
    },
  });
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'EXPORT',
      description: `Exported ${files.length} files as ZIP`,
      metadata: JSON.stringify({ fileCount: files.length }),
    },
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="sidlocker-export-${timestamp}.zip"`,
      'Content-Length': zipBuffer.length.toString(),
    },
  });
}
