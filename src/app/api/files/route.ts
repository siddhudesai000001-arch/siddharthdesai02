// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/files - list files with optional filters
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const folderId = searchParams.get('folderId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  const where: any = { userId, isDeleted: false };
  if (category) where.category = category;
  if (folderId) where.folderId = folderId;

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { folder: true },
    }),
    prisma.file.count({ where }),
  ]);

  return NextResponse.json({ files, total, page, limit });
}

// PATCH /api/files - update file (rename, move, etc.)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { id, displayName, folderId, description, tags } = body;

  if (!id) return NextResponse.json({ error: 'File ID required' }, { status: 400 });

  const file = await prisma.file.findFirst({ where: { id, userId } });
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const updated = await prisma.file.update({
    where: { id },
    data: {
      ...(displayName && { displayName }),
      ...(folderId !== undefined && { folderId }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && { tags }),
    },
  });

  // Log
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'RENAME',
      description: `Renamed/updated file: ${file.displayName} → ${displayName || file.displayName}`,
      metadata: JSON.stringify({ fileId: id }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/files - soft delete
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { ids } = body; // array of IDs

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'File IDs array required' }, { status: 400 });
  }

  // Verify ownership
  const files = await prisma.file.findMany({ where: { id: { in: ids }, userId } });
  if (files.length !== ids.length) {
    return NextResponse.json({ error: 'Some files not found' }, { status: 404 });
  }

  await prisma.file.updateMany({
    where: { id: { in: ids }, userId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: 'DELETE',
      description: `Deleted ${ids.length} file(s): ${files.map((f) => f.displayName).join(', ')}`,
      metadata: JSON.stringify({ fileIds: ids }),
    },
  });

  return NextResponse.json({ success: true, deleted: ids.length });
}
