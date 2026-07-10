import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from './user.validation';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users/profile:
 *   patch:
 *     summary: Update the authenticated user's profile (full name, phone)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated }
 */
router.patch('/profile', validate(updateProfileSchema), asyncHandler(userController.updateProfile));

/**
 * @openapi
 * /api/users/password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Password changed }
 *       401: { description: Current password incorrect }
 */
router.patch('/password', validate(changePasswordSchema), asyncHandler(userController.changePassword));

export default router;
