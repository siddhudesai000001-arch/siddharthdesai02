// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('id');

  if (!fileId) return NextResponse.json({ error: 'File ID required' }, { status: 400 });

  const file = await prisma.file.findFirst({ where: { id: fileId, userId, isDeleted: false } });
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  try {
    const uploadsBase = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsBase, file.path);
    const buffer = await readFile(filePath);

    // Log download
    await prisma.downloadHistory.create({
      data: { userId, fileId: file.id, filename: file.filename },
    });
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DOWNLOAD',
        description: `Downloaded: ${file.displayName}`,
        metadata: JSON.stringify({ fileId: file.id }),
      },
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not accessible on disk' }, { status: 404 });
  }
}
