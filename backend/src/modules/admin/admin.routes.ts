import { Router } from 'express';
import * as adminController from './admin.controller';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './admin.validation';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

/**
 * @openapi
 * /api/admin/overview:
 *   get:
 *     summary: Platform-wide overview counts (users, products, orders, transactions, revenue)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Platform overview }
 */
router.get('/overview', asyncHandler(adminController.overview));

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all users (search, filter by role, paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of users }
 */
router.get('/users', asyncHandler(adminController.users));

/**
 * @openapi
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update a user's role or active status
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User updated }
 *       404: { description: User not found }
 */
router.patch('/users/:id', validate(updateUserSchema), asyncHandler(adminController.updateUser));

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     summary: List all products across all farmers (search, filter by status, paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of products }
 */
router.get('/products', asyncHandler(adminController.products));

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     summary: List all orders platform-wide (filter by status, paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/orders', asyncHandler(adminController.orders));

/**
 * @openapi
 * /api/admin/transactions:
 *   get:
 *     summary: List all Stellar transactions platform-wide (search, filter by status, paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of transactions }
 */
router.get('/transactions', asyncHandler(adminController.transactions));

/**
 * @openapi
 * /api/admin/wallets:
 *   get:
 *     summary: List all Stellar wallets platform-wide (paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of wallets }
 */
router.get('/wallets', asyncHandler(adminController.wallets));

/**
 * @openapi
 * /api/admin/activity-logs:
 *   get:
 *     summary: List activity logs platform-wide (filter by user or action, paginated)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of activity log entries }
 */
router.get('/activity-logs', asyncHandler(adminController.activityLogs));

/**
 * @openapi
 * /api/admin/export/{entity}:
 *   get:
 *     summary: Export a platform-wide entity as CSV (users, products, orders, transactions)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema: { type: string, enum: [users, products, orders, transactions] }
 *     responses:
 *       200: { description: CSV file }
 *       400: { description: Unknown export entity }
 */
router.get('/export/:entity', asyncHandler(adminController.exportEntity));

export default router;
