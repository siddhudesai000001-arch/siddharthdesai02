// src/lib/activity.ts
import prisma from './prisma';
import { ActivityAction } from '@/types';

export async function logActivity(
  userId: string,
  action: ActivityAction,
  description: string,
  metadata: Record<string, any> = {},
  ipAddress: string = ''
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        metadata: JSON.stringify(metadata),
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivity(userId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
