import { Router } from 'express';
import * as transactionController from './transaction.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     summary: List the authenticated user's Stellar transaction history (search + pagination)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches transaction hash or memo
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, SUCCESS, FAILED] }
 *     responses:
 *       200: { description: Transaction history }
 */
router.get('/', asyncHandler(transactionController.list));

/**
 * @openapi
 * /api/transactions/export:
 *   get:
 *     summary: Export the authenticated user's transaction history as CSV
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV file }
 */
router.get('/export', asyncHandler(transactionController.exportCsv));

/**
 * @openapi
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction (must be sender, receiver, or admin)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction detail }
 *       403: { description: No access to this transaction }
 *       404: { description: Transaction not found }
 */
router.get('/:id', asyncHandler(transactionController.getById));

export default router;
