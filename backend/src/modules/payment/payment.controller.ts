import { Request, Response } from 'express';
import * as paymentService from './payment.service';
import { AppError } from '../../utils/AppError';

export async function commit(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await paymentService.commitPayment(req.params.id, req.user.userId);
  res.status(200).json({
    success: true,
    message: 'Payment committed and funds locked in escrow on Stellar Testnet',
    data: order,
  });
}

export async function deliver(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await paymentService.markDelivered(req.params.id, req.user.userId);
  res.status(200).json({ success: true, message: 'Order marked as delivered', data: order });
}

export async function confirm(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await paymentService.confirmDeliveryAndRelease(req.params.id, req.user.userId);
  res.status(200).json({
    success: true,
    message: 'Delivery confirmed and escrow funds released to the farmer on Stellar Testnet',
    data: order,
  });
}

export async function qrCode(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const qr = await paymentService.getOrderPaymentQr(req.params.id, req.user);
  res.status(200).json({ success: true, data: qr });
}
