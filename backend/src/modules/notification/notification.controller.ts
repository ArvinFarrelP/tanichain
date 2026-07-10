import { Request, Response } from 'express';
import * as notificationService from './notification.service';
import { AppError } from '../../utils/AppError';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);

  const result = await notificationService.listNotifications(req.user.userId, { page, limit });

  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const count = await notificationService.getUnreadCount(req.user.userId);
  res.status(200).json({ success: true, data: { count } });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const notification = await notificationService.markAsRead(req.user.userId, req.params.id);
  res.status(200).json({ success: true, data: notification });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  await notificationService.markAllAsRead(req.user.userId);
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
}
