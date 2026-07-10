import { Request, Response } from 'express';
import * as adminService from './admin.service';
import * as analyticsService from '../analytics/analytics.service';
import * as activityService from '../activity/activity.service';
import * as exportService from '../export/export.service';
import { AppError } from '../../utils/AppError';

function pageParams(req: Request) {
  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);
  return { page, limit };
}

export async function overview(_req: Request, res: Response): Promise<void> {
  const data = await analyticsService.getPlatformOverview();
  res.status(200).json({ success: true, data });
}

export async function users(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const search = (req.query.search as string) || undefined;
  const role = (req.query.role as string) || undefined;
  const result = await adminService.listUsers({ page, limit, search, role });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const user = await adminService.updateUser(req.user.userId, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'User updated', data: user });
}

export async function products(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const search = (req.query.search as string) || undefined;
  const status = (req.query.status as string) || undefined;
  const result = await adminService.listAllProducts({ page, limit, search, status });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function orders(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const status = (req.query.status as string) || undefined;
  const result = await adminService.listAllOrders({ page, limit, status });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function transactions(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const search = (req.query.search as string) || undefined;
  const status = (req.query.status as string) || undefined;
  const result = await adminService.listAllTransactions({ page, limit, search, status });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function wallets(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const result = await adminService.listAllWallets({ page, limit });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function activityLogs(req: Request, res: Response): Promise<void> {
  const { page, limit } = pageParams(req);
  const action = (req.query.action as string) || undefined;
  const userId = (req.query.userId as string) || undefined;
  const result = await activityService.listActivity({ page, limit, action, userId });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function exportEntity(req: Request, res: Response): Promise<void> {
  const entity = req.params.entity;

  const exporters: Record<string, () => Promise<string>> = {
    users: exportService.exportAllUsersCsv,
    products: exportService.exportAllProductsCsv,
    orders: exportService.exportAllOrdersCsv,
    transactions: exportService.exportAllTransactionsCsv,
  };

  const exporter = exporters[entity];
  if (!exporter) {
    throw AppError.badRequest(`Unknown export entity "${entity}". Valid options: ${Object.keys(exporters).join(', ')}`);
  }

  const csv = await exporter();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tanichain-${entity}.csv"`);
  res.status(200).send(csv);
}
