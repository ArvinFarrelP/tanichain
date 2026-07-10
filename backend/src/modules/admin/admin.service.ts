import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logActivity } from '../activity/activity.service';
import { UpdateUserInput } from './admin.validation';

function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export async function listUsers(params: { page: number; limit: number; search?: string; role?: string }) {
  const { page, limit, search, role } = params;

  const where: Record<string, unknown> = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        wallet: { select: { publicKey: true, isFunded: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.user.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateUser(adminId: string, userId: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });

  await logActivity({
    userId: adminId,
    action: 'PROFILE_UPDATED',
    metadata: { targetUserId: userId, changes: input, byAdmin: true },
  });

  return updated;
}

export async function listAllProducts(params: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = params;

  const where: Record<string, unknown> = {
    ...(status ? { status } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { farmer: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.product.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAllOrders(params: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = params;
  const where = status ? { status: status as never } : {};

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
        buyer: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.order.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAllTransactions(params: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = params;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { stellarTxHash: { contains: search, mode: 'insensitive' as const } },
            { memo: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { order: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAllWallets(params: { page: number; limit: number }) {
  const { page, limit } = params;

  const [items, total] = await Promise.all([
    prisma.wallet.findMany({
      include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.wallet.count(),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
