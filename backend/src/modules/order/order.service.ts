import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logActivity } from '../activity/activity.service';
import { CreateOrderInput } from './order.validation';

const ORDER_INCLUDE = {
  product: { include: { farmer: { select: { id: true, fullName: true } } } },
  buyer: { select: { id: true, fullName: true, email: true } },
  paymentCommitment: true,
  transactions: { orderBy: { createdAt: 'desc' as const } },
};

export async function createOrder(buyerId: string, input: CreateOrderInput) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });

  if (!product) {
    throw AppError.notFound('Product not found');
  }
  if (product.status !== 'AVAILABLE') {
    throw AppError.badRequest('This product is not currently available');
  }
  if (product.farmerId === buyerId) {
    throw AppError.badRequest('You cannot order your own product');
  }
  if (product.quantity < input.quantity) {
    throw AppError.badRequest(`Only ${product.quantity} ${product.unit} available`);
  }

  const totalAmount = Number((product.pricePerUnit * input.quantity).toFixed(7));

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId,
        productId: product.id,
        quantity: input.quantity,
        totalAmount,
        status: 'PENDING',
      },
      include: ORDER_INCLUDE,
    });

    const remaining = product.quantity - input.quantity;
    await tx.product.update({
      where: { id: product.id },
      data: {
        quantity: remaining,
        status: remaining <= 0 ? 'SOLD_OUT' : product.status,
      },
    });

    return created;
  });

  await logActivity({
    userId: buyerId,
    action: 'ORDER_CREATED',
    metadata: { orderId: order.id, productId: product.id, totalAmount: order.totalAmount },
  });

  return order;
}

export async function getOrderById(orderId: string, requester: { userId: string; role: string }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });

  if (!order) {
    throw AppError.notFound('Order not found');
  }
  if (!order.product) {
    throw AppError.internal('Order is missing its product relation');
  }

  const isBuyer = order.buyerId === requester.userId;
  const isFarmer = order.product.farmerId === requester.userId;
  const isAdmin = requester.role === 'ADMIN';

  if (!isBuyer && !isFarmer && !isAdmin) {
    throw AppError.forbidden('You do not have access to this order');
  }

  return order;
}

export async function listOrders(
  requester: { userId: string; role: string },
  params: { page: number; limit: number; status?: string },
) {
  const { page, limit, status } = params;
  const skip = (page - 1) * limit;

  const baseWhere: Record<string, unknown> = status ? { status } : {};

  const where: Record<string, unknown> =
    requester.role === 'ADMIN'
      ? baseWhere
      : requester.role === 'FARMER'
        ? { ...baseWhere, product: { farmerId: requester.userId } }
        : { ...baseWhere, buyerId: requester.userId };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function cancelOrder(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });

  if (!order) {
    throw AppError.notFound('Order not found');
  }
  if (order.buyerId !== buyerId) {
    throw AppError.forbidden('You do not own this order');
  }
  if (order.status !== 'PENDING') {
    throw AppError.badRequest('Only pending orders (not yet paid or committed) can be cancelled');
  }
  if (!order.product) {
    throw AppError.internal('Order is missing its product relation');
  }
  const product = order.product;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: ORDER_INCLUDE,
    });

    await tx.product.update({
      where: { id: order.productId },
      data: {
        quantity: product.quantity + order.quantity,
        status: 'AVAILABLE',
      },
    });

    return updated;
  });

  await logActivity({ userId: buyerId, action: 'ORDER_CANCELLED', metadata: { orderId } });

  return result;
}

export type { CreateOrderInput };
