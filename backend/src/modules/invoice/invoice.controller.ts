import { Request, Response } from 'express';
import * as invoiceService from './invoice.service';
import { AppError } from '../../utils/AppError';

export async function download(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const order = await invoiceService.getInvoiceOrder(req.params.id, req.user);
  const invoiceNumber = `TANI-${order.id.slice(0, 8).toUpperCase()}`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);

  const stream = invoiceService.renderInvoicePdf(order);
  stream.pipe(res);
}
