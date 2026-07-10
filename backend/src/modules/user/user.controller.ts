import { Request, Response } from 'express';
import * as userService from './user.service';
import { AppError } from '../../utils/AppError';

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const user = await userService.updateProfile(req.user.userId, req.body);
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  await userService.changePassword(req.user.userId, req.body);
  res.status(200).json({ success: true, message: 'Password changed successfully' });
}
