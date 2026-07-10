import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { AppError } from '../../utils/AppError';

export async function summary(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const data = await analyticsService.getSummary(req.user);
  res.status(200).json({ success: true, data });
}
