import { Router } from 'express';
import * as orderController from './order.controller';
import * as paymentController from '../payment/payment.controller';
import * as invoiceController from '../invoice/invoice.controller';
import { validate } from '../../middleware/validate';
import { createOrderSchema } from './order.validation';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create an order (buyer purchases a product)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Order created }
 *       400: { description: Invalid quantity or product unavailable }
 */
router.post('/', authorize('BUYER', 'COOPERATIVE'), validate(createOrderSchema), asyncHandler(orderController.create));

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: List orders visible to the authenticated user (buyer sees own, farmer sees orders on their products, admin sees all)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/', asyncHandler(orderController.list));

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order detail (buyer, farmer, or admin only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order detail with payment commitment and transactions }
 *       403: { description: No access to this order }
 *       404: { description: Order not found }
 */
router.get('/:id', asyncHandler(orderController.getById));

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel a pending order and restore product stock (buyer only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order cancelled }
 *       400: { description: Order is no longer pending }
 */
router.post('/:id/cancel', authorize('BUYER', 'COOPERATIVE'), asyncHandler(orderController.cancel));

/**
 * @openapi
 * /api/orders/{id}/commit:
 *   post:
 *     summary: >
 *       Payment Commitment step 1 - buyer commits payment. Submits a real Stellar
 *       Testnet transaction moving the order total from the buyer's wallet into
 *       the platform escrow wallet, locking the funds.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Funds locked in escrow, transaction hash recorded }
 *       400: { description: Order already committed or Stellar transaction failed }
 */
router.post('/:id/commit', authorize('BUYER', 'COOPERATIVE'), asyncHandler(paymentController.commit));

/**
 * @openapi
 * /api/orders/{id}/deliver:
 *   post:
 *     summary: >
 *       Payment Commitment step 2 - farmer verifies the escrow-locked payment
 *       and marks the goods as delivered.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order marked delivered }
 *       400: { description: Order is not in escrow-locked state }
 */
router.post('/:id/deliver', authorize('FARMER'), asyncHandler(paymentController.deliver));

/**
 * @openapi
 * /api/orders/{id}/confirm:
 *   post:
 *     summary: >
 *       Payment Commitment step 3 - buyer confirms delivery. Submits a real
 *       Stellar Testnet transaction releasing escrow-locked funds to the farmer.
 *       Order status becomes PAID.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Escrow released, order marked PAID }
 *       400: { description: Order is not in delivered state }
 */
router.post('/:id/confirm', authorize('BUYER', 'COOPERATIVE'), asyncHandler(paymentController.confirm));

/**
 * @openapi
 * /api/orders/{id}/qrcode:
 *   get:
 *     summary: Get a QR code encoding the Stellar payment destination/amount for this order (buyer, farmer, or admin)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: QR code data URL and Stellar pay URI }
 *       403: { description: No access to this order }
 */
router.get('/:id/qrcode', asyncHandler(paymentController.qrCode));

/**
 * @openapi
 * /api/orders/{id}/invoice:
 *   get:
 *     summary: Download a PDF invoice for this order (buyer, farmer, or admin)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF invoice stream }
 *       403: { description: No access to this order }
 */
router.get('/:id/invoice', asyncHandler(invoiceController.download));

export default router;
