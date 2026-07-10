import { Router } from 'express';
import * as walletController from './wallet.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/wallet/me:
 *   get:
 *     summary: Get the authenticated user's wallet with a live Stellar Testnet balance
 *     tags: [Wallet]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet detail with balance }
 *       404: { description: Wallet not found }
 */
router.get('/me', asyncHandler(walletController.me));

/**
 * @openapi
 * /api/wallet/qrcode:
 *   get:
 *     summary: Generate a QR code (and Stellar pay URI) for receiving funds into the authenticated user's wallet
 *     tags: [Wallet]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: QR code data URL and Stellar pay URI }
 */
router.get('/qrcode', asyncHandler(walletController.receiveQrCode));

export default router;
