import { prisma } from '../../config/db';
import { getWalletWithBalance } from '../wallet/wallet.service';

interface Requester {
  userId: string;
  role: string;
}

function scopeFilter(requester: Requester): Record<string, unknown> {
  if (requester.role === 'ADMIN') return {};
  if (requester.role === 'FARMER') return { product: { farmerId: requester.userId } };
  return { buyerId: requester.userId };
}

export async function getSummary(requester: Requester) {
  const where = scopeFilter(requester);

  const escrowOrPendingDeliveryWhere: Record<string, unknown> = { ...where, status: { in: ['ESCROW_LOCKED', 'DELIVERED'] } };

  const [totalOrders, paidOrders, pendingOrders, escrowLockedOrders, cancelledOrders, revenueAgg, pendingAgg] =
    await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'PAID' } }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: escrowOrPendingDeliveryWhere }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.order.aggregate({ where: { ...where, status: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        where: escrowOrPendingDeliveryWhere,
        _sum: { totalAmount: true },
      }),
    ]);

  let walletBalance: string | null = null;
  if (requester.role !== 'ADMIN') {
    try {
      const wallet = await getWalletWithBalance(requester.userId);
      walletBalance = wallet.balance;
    } catch {
      walletBalance = null;
    }
  }

  // Monthly revenue series for the trailing 6 months (paid orders only).
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentOrdersWhere: Record<string, unknown> = { ...where, status: 'PAID', updatedAt: { gte: sixMonthsAgo } };
  const recentPaidOrders = await prisma.order.findMany({
    where: recentOrdersWhere,
    select: { totalAmount: true, updatedAt: true },
  });

  const monthlyRevenue = buildMonthlySeries(sixMonthsAgo, recentPaidOrders);

  const statusBreakdown = [
    { status: 'PENDING', count: pendingOrders },
    { status: 'ESCROW_LOCKED', count: escrowLockedOrders },
    { status: 'PAID', count: paidOrders },
    { status: 'CANCELLED', count: cancelledOrders },
  ];

  return {
    totalOrders,
    paidOrders,
    pendingOrders,
    escrowLockedOrders,
    cancelledOrders,
    totalRevenue: revenueAgg._sum.totalAmount ?? 0,
    pendingAmount: pendingAgg._sum.totalAmount ?? 0,
    walletBalance,
    monthlyRevenue,
    statusBreakdown,
  };
}

function buildMonthlySeries(start: Date, orders: Array<{ totalAmount: number; updatedAt: Date }>) {
  const months: { key: string; label: string; total: number }[] = [];
  const cursor = new Date(start);

  for (let i = 0; i < 6; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    const label = cursor.toLocaleDateString('en-US', { month: 'short' });
    months.push({ key, label, total: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const order of orders) {
    const key = `${order.updatedAt.getFullYear()}-${String(order.updatedAt.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) {
      bucket.total += order.totalAmount;
    }
  }

  return months.map(({ label, total }) => ({ month: label, revenue: Number(total.toFixed(2)) }));
}

export async function getPlatformOverview() {
  const [userCount, farmerCount, buyerCount, productCount, orderCount, transactionCount, revenueAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.transaction.count(),
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
    ]);

  return {
    userCount,
    farmerCount,
    buyerCount,
    productCount,
    orderCount,
    transactionCount,
    totalPlatformRevenue: revenueAgg._sum.totalAmount ?? 0,
  };
}
