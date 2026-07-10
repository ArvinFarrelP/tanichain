import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     summary: >
 *       Role-aware analytics summary (revenue, pending/completed payments, wallet
 *       balance, monthly revenue series, order status breakdown). Farmers see
 *       stats scoped to their products, buyers to their purchases, admins platform-wide.
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Analytics summary }
 */
router.get('/summary', asyncHandler(analyticsController.summary));

export default router;
