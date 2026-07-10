import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';

export type ActivityAction =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'PROFILE_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'ORDER_CREATED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_COMMITTED'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_RELEASED';

/**
 * Records an activity log entry. This is intentionally fire-and-forget from
 * the caller's perspective (errors are swallowed and logged) so that audit
 * logging can never break the primary business operation it's attached to.
 */
export async function logActivity(params: {
  userId?: string | null;
  action: ActivityAction;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        metadata: params.metadata,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    logger.warn('Failed to write activity log', {
      action: params.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function listActivity(params: {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
}) {
  const { page, limit, userId, action } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(userId ? { userId } : {}),
    ...(action ? { action } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listMyActivity(
  userId: string,
  params: {
    page: number;
    limit: number;
  }
) {
  return listActivity({
    ...params,
    userId,
  });
}