import { Request, Response } from 'express';
import * as productService from './product.service';
import { AppError } from '../../utils/AppError';

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const product = await productService.createProduct(req.user.userId, req.body);
  res.status(201).json({ success: true, message: 'Product created', data: product });
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const product = await productService.updateProduct(req.params.id, req.user.userId, req.body);
  res.status(200).json({ success: true, message: 'Product updated', data: product });
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const result = await productService.deleteProduct(req.params.id, req.user.userId);
  res.status(200).json({
    success: true,
    message: result ? 'Product archived (it has existing orders)' : 'Product deleted',
    data: result,
  });
}

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);

  const result = await productService.getMyProducts(req.user.userId, { page, limit });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function browse(req: Request, res: Response): Promise<void> {
  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? '20', 10) || 20, 1), 100);
  const search = (req.query.search as string) || undefined;
  const category = (req.query.category as string) || undefined;

  const result = await productService.browseProducts({ page, limit, search, category });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
}
