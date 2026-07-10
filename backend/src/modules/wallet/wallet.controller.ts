import { Request, Response } from 'express';
import { getWalletWithBalance } from './wallet.service';
import { generateWalletReceiveQr } from './qrcode.service';
import { AppError } from '../../utils/AppError';

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const wallet = await getWalletWithBalance(req.user.userId);
  res.status(200).json({ success: true, data: wallet });
}

export async function receiveQrCode(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const wallet = await getWalletWithBalance(req.user.userId);
  const qr = await generateWalletReceiveQr(wallet.publicKey);
  res.status(200).json({ success: true, data: qr });
}
