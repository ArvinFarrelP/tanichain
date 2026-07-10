import { Request, Response } from 'express';
import * as transactionService from './transaction.service';
import * as exportService from '../export/export.service';
import { AppError } from '../../utils/AppError';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);
  const search = (req.query.search as string) || undefined;
  const status = (req.query.status as string) || undefined;

  const result = await transactionService.listMyTransactions(req.user.userId, { page, limit, search, status });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function getById(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const transaction = await transactionService.getTransactionById(req.params.id, req.user);
  res.status(200).json({ success: true, data: transaction });
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const csv = await exportService.exportMyTransactionsCsv(req.user.userId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="tanichain-transactions.csv"');
  res.status(200).send(csv);
}
