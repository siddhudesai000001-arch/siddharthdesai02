// src/app/api/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const where: any = {};
  if (category) where.category = category;

  const folders = await prisma.folder.findMany({
    where,
    include: {
      children: true,
      _count: { select: { files: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, displayName, parentId, category } = body;

  if (!name || !category) return NextResponse.json({ error: 'Name and category required' }, { status: 400 });

  let parentPath = '';
  if (parentId) {
    const parent = await prisma.folder.findUnique({ where: { id: parentId } });
    if (parent) parentPath = parent.path + '/';
  }

  const path = `${parentPath}${name.toLowerCase().replace(/\s+/g, '_')}`;

  const folder = await prisma.folder.create({
    data: {
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName || name,
      path,
      parentId: parentId || null,
      category,
    },
  });

  return NextResponse.json(folder);
}
