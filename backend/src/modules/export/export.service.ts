import { prisma } from '../../config/db';
import { getWalletByUserId } from '../wallet/wallet.service';

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T extends object>(rows: T[], columns: Array<keyof T>): string {
  const header = columns.join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(','));
  return [header, ...lines].join('\n');
}

export async function exportMyTransactionsCsv(userId: string): Promise<string> {
  const wallet = await getWalletByUserId(userId);

  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ senderPublicKey: wallet.publicKey }, { receiverPublicKey: wallet.publicKey }] },
    orderBy: { createdAt: 'desc' },
  });

  return toCsv(transactions, [
    'id',
    'type',
    'status',
    'senderPublicKey',
    'receiverPublicKey',
    'amount',
    'assetCode',
    'memo',
    'stellarTxHash',
    'explorerUrl',
    'createdAt',
  ]);
}

export async function exportAllUsersCsv(): Promise<string> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return toCsv(users, ['id', 'email', 'fullName', 'phone', 'role', 'isActive', 'createdAt']);
}

export async function exportAllProductsCsv(): Promise<string> {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return toCsv(products, [
    'id',
    'farmerId',
    'name',
    'category',
    'quantity',
    'unit',
    'pricePerUnit',
    'status',
    'createdAt',
  ]);
}

export async function exportAllOrdersCsv(): Promise<string> {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  return toCsv(orders, ['id', 'buyerId', 'productId', 'quantity', 'totalAmount', 'status', 'createdAt']);
}

export async function exportAllTransactionsCsv(): Promise<string> {
  const transactions = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  return toCsv(transactions, [
    'id',
    'orderId',
    'type',
    'status',
    'senderPublicKey',
    'receiverPublicKey',
    'amount',
    'stellarTxHash',
    'createdAt',
  ]);
}
