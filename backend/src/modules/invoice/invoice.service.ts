import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';

const ORDER_INCLUDE = {
  product: { include: { farmer: { select: { id: true, fullName: true, email: true } } } },
  buyer: { select: { id: true, fullName: true, email: true } },
  paymentCommitment: true,
  transactions: { orderBy: { createdAt: 'asc' as const } },
};

export async function getInvoiceOrder(orderId: string, requester: { userId: string; role: string }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });

  if (!order) throw AppError.notFound('Order not found');
  if (!order.product) throw AppError.internal('Order is missing its product relation');

  const isBuyer = order.buyerId === requester.userId;
  const isFarmer = order.product.farmerId === requester.userId;
  if (!isBuyer && !isFarmer && requester.role !== 'ADMIN') {
    throw AppError.forbidden('You do not have access to this order');
  }

  return order;
}

type InvoiceOrder = Awaited<ReturnType<typeof getInvoiceOrder>>;

/**
 * Streams a PDF invoice for the given order directly to the response.
 * Returns the PDFDocument so the caller can pipe it and handle stream events.
 */
export function renderInvoicePdf(order: InvoiceOrder): PassThrough {
  if (!order.product) {
    throw new Error('Invoice generation requires the order.product relation to be included');
  }
  if (!order.buyer) {
    throw new Error('Invoice generation requires the order.buyer relation to be included');
  }
  const product = order.product;
  const buyer = order.buyer;
  const transactions = order.transactions ?? [];

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  const invoiceNumber = `TANI-${order.id.slice(0, 8).toUpperCase()}`;

  doc
    .fontSize(20)
    .fillColor('#4f7c2e')
    .text('TaniChain', { continued: true })
    .fillColor('#333')
    .fontSize(10)
    .text('  Transparent Agricultural Payment Network', { align: 'left' });

  doc.moveDown(1.5);
  doc.fontSize(16).fillColor('#000').text('INVOICE', { align: 'right' });
  doc.fontSize(10).fillColor('#555').text(`Invoice #: ${invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US')}`, { align: 'right' });
  doc.text(`Order ID: ${order.id}`, { align: 'right' });

  doc.moveDown(1.5);
  doc.fontSize(11).fillColor('#000').text('Farmer (Seller)', { underline: true });
  doc.fontSize(10).fillColor('#333');
  doc.text(product.farmer?.fullName ?? 'Unknown');
  doc.text(product.farmer?.email ?? '');
  if (order.paymentCommitment?.farmerPublicKey) {
    doc.text(`Wallet: ${order.paymentCommitment.farmerPublicKey}`);
  }

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#000').text('Buyer', { underline: true });
  doc.fontSize(10).fillColor('#333');
  doc.text(buyer.fullName);
  doc.text(buyer.email);
  if (order.paymentCommitment?.buyerPublicKey) {
    doc.text(`Wallet: ${order.paymentCommitment.buyerPublicKey}`);
  }

  doc.moveDown(1.5);

  const tableTop = doc.y;
  doc.fontSize(10).fillColor('#000');
  doc.text('Description', 50, tableTop, { width: 220 });
  doc.text('Quantity', 270, tableTop, { width: 80 });
  doc.text('Unit Price', 350, tableTop, { width: 90 });
  doc.text('Total', 450, tableTop, { width: 90 });
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#ccc').stroke();

  const rowY = tableTop + 25;
  doc.fontSize(10).fillColor('#333');
  doc.text(product.name, 50, rowY, { width: 220 });
  doc.text(`${order.quantity} ${product.unit}`, 270, rowY, { width: 80 });
  doc.text(`${product.pricePerUnit.toFixed(2)} XLM`, 350, rowY, { width: 90 });
  doc.text(`${order.totalAmount.toFixed(2)} XLM`, 450, rowY, { width: 90 });

  doc.moveTo(50, rowY + 25).lineTo(545, rowY + 25).strokeColor('#ccc').stroke();

  doc.fontSize(12).fillColor('#4f7c2e').text(`Total: ${order.totalAmount.toFixed(2)} XLM`, 350, rowY + 35, {
    width: 190,
    align: 'right',
  });

  doc.moveDown(4);
  doc.fontSize(11).fillColor('#000').text('Payment Status', { underline: true });
  doc.fontSize(10).fillColor('#333').text(`Order status: ${order.status}`);
  if (order.paymentCommitment?.escrowLocked) {
    doc.text('Funds were locked in escrow on Stellar Testnet at commitment time.');
  }
  if (order.paymentCommitment?.releasedAt) {
    doc.text(`Escrow released: ${new Date(order.paymentCommitment.releasedAt).toLocaleString('en-US')}`);
  }

  if (transactions.length > 0) {
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#000').text('Blockchain Transactions', { underline: true });
    doc.fontSize(9).fillColor('#333');
    for (const tx of transactions) {
      doc.text(`${tx.type} — ${tx.amount.toFixed(2)} XLM — hash: ${tx.stellarTxHash ?? 'n/a'} — ${tx.status}`);
      if (tx.explorerUrl) {
        doc.fillColor('#4f7c2e').text(tx.explorerUrl, { link: tx.explorerUrl, underline: true });
        doc.fillColor('#333');
      }
    }
  }

  doc.moveDown(2);
  doc.fontSize(8).fillColor('#999').text(
    'This invoice was generated by TaniChain and reflects Stellar Testnet transactions. Testnet transactions have no real-world monetary value.',
    { align: 'center' },
  );

  doc.end();
  return stream;
}
