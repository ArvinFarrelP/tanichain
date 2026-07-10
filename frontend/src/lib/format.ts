import { OrderStatus } from '../types';

export function formatXlm(amount: number): string {
  return `${amount.toFixed(2)} XLM`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function shortHash(hash: string | null | undefined): string {
  if (!hash) return '—';
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
}

export function shortKey(key: string | null | undefined): string {
  if (!key) return '—';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  COMMITTED: 'Committed',
  ESCROW_LOCKED: 'Escrow Locked',
  DELIVERED: 'Delivered',
  CONFIRMED: 'Confirmed',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

export function orderStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'ESCROW_LOCKED':
    case 'DELIVERED':
      return 'warning';
    case 'CANCELLED':
    case 'DISPUTED':
      return 'destructive';
    case 'PENDING':
      return 'secondary';
    default:
      return 'outline';
  }
}
