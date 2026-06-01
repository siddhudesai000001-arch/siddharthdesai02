// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const extension = searchParams.get('extension') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  if (!query && !category && !extension && !dateFrom && !dateTo) {
    return NextResponse.json({ files: [], folders: [], total: 0 });
  }

  // Build file filter - NEVER search Aadhaar, PAN, phone, address
  const fileWhere: any = {
    userId,
    isDeleted: false,
    OR: query
      ? [
          { filename: { contains: query } },
          { displayName: { contains: query } },
          { tags: { contains: query } },
          { description: { contains: query } },
        ]
      : undefined,
  };

  if (!fileWhere.OR) delete fileWhere.OR;
  if (category) fileWhere.category = category;
  if (extension) fileWhere.extension = extension.replace('.', '').toLowerCase();
  if (dateFrom || dateTo) {
    fileWhere.uploadedAt = {};
    if (dateFrom) fileWhere.uploadedAt.gte = new Date(dateFrom);
    if (dateTo) fileWhere.uploadedAt.lte = new Date(dateTo + 'T23:59:59');
  }

  // Folder search
  const folderWhere: any = query
    ? { OR: [{ name: { contains: query } }, { displayName: { contains: query } }] }
    : {};

  const [files, folders] = await Promise.all([
    prisma.file.findMany({
      where: fileWhere,
      orderBy: { uploadedAt: 'desc' },
      take: 50,
      include: { folder: true },
    }),
    query
      ? prisma.folder.findMany({ where: folderWhere, take: 10 })
      : Promise.resolve([]),
  ]);

  // Log search
  if (query) {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SEARCH',
        description: `Searched for: "${query}"`,
        metadata: JSON.stringify({ query, category, extension }),
      },
    });
  }

  return NextResponse.json({ files, folders, total: files.length + folders.length });
}
