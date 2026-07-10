import { Request, Response } from 'express';
import * as orderService from './order.service';
import { AppError } from '../../utils/AppError';

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await orderService.createOrder(req.user.userId, req.body);
  res.status(201).json({ success: true, message: 'Order created', data: order });
}

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);
  const status = (req.query.status as string) || undefined;

  const result = await orderService.listOrders(req.user, { page, limit, status });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function getById(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
}

export async function cancel(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await orderService.cancelOrder(req.params.id, req.user.userId);
  res.status(200).json({ success: true, message: 'Order cancelled', data: order });
}
