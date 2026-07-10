import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { submitPayment, buildExplorerUrl } from '../wallet/stellar.service';
import { generateOrderPaymentQr } from '../wallet/qrcode.service';
import { getDecryptedSecret, getWalletByUserId } from '../wallet/wallet.service';
import { getOrCreateEscrowWallet, getEscrowDecryptedSecret } from '../escrow/escrow.service';
import { createNotification } from '../notification/notification.service';
import { logActivity } from '../activity/activity.service';
import { logger } from '../../utils/logger';

const ORDER_INCLUDE = {
  product: { include: { farmer: { select: { id: true, fullName: true } } } },
  buyer: { select: { id: true, fullName: true, email: true } },
  paymentCommitment: true,
  transactions: { orderBy: { createdAt: 'desc' as const } },
};

/**
 * Step 1 of the workflow: "Buyer clicks Commit Payment".
 * Buyer -> Escrow: a real Stellar Testnet transaction deposits the order
 * amount into the platform escrow wallet. Funds are now locked.
 */
export async function commitPayment(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });

  if (!order) throw AppError.notFound('Order not found');
  if (order.buyerId !== buyerId) throw AppError.forbidden('You do not own this order');
  if (order.status !== 'PENDING') throw AppError.badRequest('This order has already been committed');
  if (!order.product) throw AppError.internal('Order is missing its product relation');

  const buyerWallet = await getWalletByUserId(buyerId);
  const farmerWallet = await getWalletByUserId(order.product.farmerId);
  const escrow = await getOrCreateEscrowWallet();
  const buyerSecret = await getDecryptedSecret(buyerId);

  const amountStr = order.totalAmount.toFixed(7);

  const result = await submitPayment({
    senderSecret: buyerSecret,
    receiverPublicKey: escrow.publicKey,
    amount: amountStr,
    memo: `TaniChain order ${order.id.slice(0, 8)}`,
  });

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'ESCROW_LOCKED' },
      include: ORDER_INCLUDE,
    }),
    prisma.paymentCommitment.create({
      data: {
        orderId,
        buyerPublicKey: buyerWallet.publicKey,
        farmerPublicKey: farmerWallet.publicKey,
        amount: order.totalAmount,
        memo: `TaniChain order ${order.id.slice(0, 8)}`,
        stellarTxHash: result.hash,
        escrowLocked: true,
        status: 'ESCROW_LOCKED',
      },
    }),
    prisma.transaction.create({
      data: {
        orderId,
        type: 'ESCROW_DEPOSIT',
        status: 'SUCCESS',
        senderPublicKey: buyerWallet.publicKey,
        receiverPublicKey: escrow.publicKey,
        amount: order.totalAmount,
        memo: `Escrow deposit for order ${order.id.slice(0, 8)}`,
        stellarTxHash: result.hash,
        explorerUrl: result.explorerUrl,
        ledger: result.ledger,
      },
    }),
  ]);

  await createNotification({
    userId: order.product.farmerId,
    type: 'PAYMENT_CREATED',
    title: 'Payment committed',
    message: `A buyer has committed payment for order ${order.id.slice(0, 8)}. Funds are locked in escrow.`,
  });

  logger.info('Payment commitment created', { orderId, txHash: result.hash });

  await logActivity({
    userId: buyerId,
    action: 'PAYMENT_COMMITTED',
    metadata: { orderId, txHash: result.hash, amount: order.totalAmount },
  });

  return updatedOrder;
}

/**
 * Step 2: farmer verifies the payment commitment and ships/delivers the goods.
 */
export async function markDelivered(orderId: string, farmerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });

  if (!order) throw AppError.notFound('Order not found');
  if (!order.product) throw AppError.internal('Order is missing its product relation');
  if (order.product.farmerId !== farmerId) throw AppError.forbidden('You do not own the product in this order');
  if (order.status !== 'ESCROW_LOCKED') {
    throw AppError.badRequest('Order must have funds locked in escrow before it can be marked delivered');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DELIVERED' },
    include: ORDER_INCLUDE,
  });

  await createNotification({
    userId: order.buyerId,
    type: 'ORDER_UPDATE',
    title: 'Order delivered',
    message: `The farmer has marked order ${order.id.slice(0, 8)} as delivered. Please confirm receipt to release payment.`,
  });

  await logActivity({ userId: farmerId, action: 'ORDER_DELIVERED', metadata: { orderId } });

  return updated;
}

/**
 * Step 3: "Buyer confirms delivery" -> escrow release.
 * Escrow -> Farmer: a real Stellar Testnet transaction releases the locked
 * funds to the farmer. Order status becomes PAID.
 */
export async function confirmDeliveryAndRelease(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, paymentCommitment: true },
  });

  if (!order) throw AppError.notFound('Order not found');
  if (order.buyerId !== buyerId) throw AppError.forbidden('You do not own this order');
  if (order.status !== 'DELIVERED') {
    throw AppError.badRequest('Order must be marked delivered before confirming receipt');
  }
  if (!order.paymentCommitment) {
    throw AppError.internal('Payment commitment missing for an escrow-locked order');
  }
  if (!order.product) {
    throw AppError.internal('Order is missing its product relation');
  }

  const farmerWallet = await getWalletByUserId(order.product.farmerId);
  const escrowSecret = await getEscrowDecryptedSecret();
  const escrow = await getOrCreateEscrowWallet();

  const amountStr = order.totalAmount.toFixed(7);

  const result = await submitPayment({
    senderSecret: escrowSecret,
    receiverPublicKey: farmerWallet.publicKey,
    amount: amountStr,
    memo: `Release order ${order.id.slice(0, 8)}`,
  });

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', deliveryConfirmedAt: new Date() },
      include: ORDER_INCLUDE,
    }),
    prisma.paymentCommitment.update({
      where: { orderId },
      data: { status: 'PAID', releasedAt: new Date() },
    }),
    prisma.transaction.create({
      data: {
        orderId,
        type: 'ESCROW_RELEASE',
        status: 'SUCCESS',
        senderPublicKey: escrow.publicKey,
        receiverPublicKey: farmerWallet.publicKey,
        amount: order.totalAmount,
        memo: `Escrow release for order ${order.id.slice(0, 8)}`,
        stellarTxHash: result.hash,
        explorerUrl: result.explorerUrl,
        ledger: result.ledger,
      },
    }),
  ]);

  await createNotification({
    userId: order.product.farmerId,
    type: 'PAYMENT_RELEASED',
    title: 'Payment released',
    message: `Escrow funds for order ${order.id.slice(0, 8)} have been released to your wallet.`,
  });
  await createNotification({
    userId: order.buyerId,
    type: 'PAYMENT_CONFIRMED',
    title: 'Payment confirmed',
    message: `Your payment for order ${order.id.slice(0, 8)} is complete. Thank you!`,
  });

  logger.info('Escrow released to farmer', { orderId, txHash: result.hash });

  await logActivity({
    userId: buyerId,
    action: 'PAYMENT_RELEASED',
    metadata: { orderId, txHash: result.hash, amount: order.totalAmount },
  });

  return updatedOrder;
}

export function toExplorerUrl(hash: string): string {
  return buildExplorerUrl(hash);
}

export async function getOrderPaymentQr(orderId: string, requester: { userId: string; role: string }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });

  if (!order) throw AppError.notFound('Order not found');
  if (!order.product) throw AppError.internal('Order is missing its product relation');

  const isBuyer = order.buyerId === requester.userId;
  const isFarmer = order.product.farmerId === requester.userId;
  if (!isBuyer && !isFarmer && requester.role !== 'ADMIN') {
    throw AppError.forbidden('You do not have access to this order');
  }

  const escrow = await getOrCreateEscrowWallet();
  const qr = await generateOrderPaymentQr({
    destination: escrow.publicKey,
    amount: order.totalAmount.toFixed(7),
    memo: `TaniChain order ${order.id.slice(0, 8)}`,
  });

  return qr;
}
