import { Router } from 'express';
import * as activityController from './activity.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/activity/mine:
 *   get:
 *     summary: List the authenticated user's own activity log entries
 *     tags: [Activity]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Activity log entries }
 */
router.get('/mine', asyncHandler(activityController.mine));

export default router;
