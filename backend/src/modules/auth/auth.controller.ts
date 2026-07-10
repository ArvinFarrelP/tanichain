import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AppError } from '../../utils/AppError';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const profile = await authService.getProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: profile,
  });
}
