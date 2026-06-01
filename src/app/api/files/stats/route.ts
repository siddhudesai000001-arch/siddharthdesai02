// src/app/api/files/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  const [
    totalDocuments,
    totalPhotos,
    totalFolders,
    storageResult,
    recentUploads,
    lastLogin,
    recentDownloads,
  ] = await Promise.all([
    prisma.file.count({ where: { userId, category: { not: 'photos' }, isDeleted: false } }),
    prisma.file.count({ where: { userId, category: 'photos', isDeleted: false } }),
    prisma.folder.count(),
    prisma.file.aggregate({ where: { userId, isDeleted: false }, _sum: { size: true } }),
    prisma.file.findMany({
      where: { userId, isDeleted: false },
      orderBy: { uploadedAt: 'desc' },
      take: 5,
      include: { folder: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { lastLogin: true } }),
    prisma.downloadHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { file: true },
    }),
  ]);

  return NextResponse.json({
    totalDocuments,
    totalPhotos,
    totalFolders,
    storageUsed: storageResult._sum.size || 0,
    recentUploads,
    lastLogin: lastLogin?.lastLogin,
    recentDownloads,
  });
}
