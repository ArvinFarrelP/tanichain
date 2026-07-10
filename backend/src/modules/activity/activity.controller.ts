import { Request, Response } from 'express';
import * as activityService from './activity.service';
import { AppError } from '../../utils/AppError';

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);

  const result = await activityService.listMyActivity(req.user.userId, { page, limit });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}
