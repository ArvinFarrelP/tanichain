'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../../lib/api';
import { formatDate, formatXlm, orderStatusLabels, orderStatusVariant } from '../../../../lib/format';
import { AdminOrder, ApiListResponse, OrderStatus } from '../../../../types';

const STATUS_OPTIONS: Array<OrderStatus | 'ALL'> = [
  'ALL', 'PENDING', 'ESCROW_LOCKED', 'DELIVERED', 'PAID', 'CANCELLED', 'DISPUTED',
];

export default function AdminOrdersPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    apiClient
      .get<ApiListResponse<AdminOrder>>('/admin/orders', { params: { status: status === 'ALL' ? undefined : status, limit: 100 } })
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady, status]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">Every order placed on the platform.</p>
        </div>
        <AdminNav />

        <div className="mb-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | 'ALL')}
            className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : orderStatusLabels[s as OrderStatus] ?? s}</option>)}
          </select>
        </div>

        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-2">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <div className="min-w-[180px] flex-1">
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-xs text-muted-foreground">{order.buyer.fullName} · {order.buyer.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                  <span className="font-display font-semibold text-primary">{formatXlm(order.totalAmount)}</span>
                  <Badge variant={orderStatusVariant(order.status)}>{orderStatusLabels[order.status]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
