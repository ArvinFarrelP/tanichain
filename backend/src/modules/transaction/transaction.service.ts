import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getWalletByUserId } from '../wallet/wallet.service';

export async function listMyTransactions(
  userId: string,
  params: { page: number; limit: number; search?: string; status?: string },
) {
  const wallet = await getWalletByUserId(userId);
  const { page, limit, search, status } = params;
  const skip = (page - 1) * limit;

  const where = {
    OR: [{ senderPublicKey: wallet.publicKey }, { receiverPublicKey: wallet.publicKey }],
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          AND: [
            {
              OR: [
                { stellarTxHash: { contains: search, mode: 'insensitive' as const } },
                { memo: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { order: { select: { id: true, productId: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getTransactionById(id: string, requester: { userId: string; role: string }) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { order: true },
  });

  if (!transaction) {
    throw AppError.notFound('Transaction not found');
  }

  if (requester.role === 'ADMIN') {
    return transaction;
  }

  const wallet = await getWalletByUserId(requester.userId);
  const owns =
    transaction.senderPublicKey === wallet.publicKey || transaction.receiverPublicKey === wallet.publicKey;

  if (!owns) {
    throw AppError.forbidden('You do not have access to this transaction');
  }

  return transaction;
}
