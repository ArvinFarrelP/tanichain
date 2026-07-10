'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListOrdered } from 'lucide-react';
import { DashboardHeader } from '../../../components/layout/DashboardHeader';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { ListSkeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useRequireAuth } from '../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../lib/api';
import { formatDate, formatXlm, orderStatusLabels, orderStatusVariant } from '../../../lib/format';
import { ApiListResponse, Order } from '../../../types';

export default function OrdersPage() {
  const { user, isReady } = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    apiClient
      .get<ApiListResponse<Order>>('/orders', { params: { limit: 50, status: status === 'ALL' ? undefined : status } })
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady, status]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mb-1 font-display text-2xl font-semibold">Orders</h1>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'FARMER'
                ? 'Orders placed for your products.'
                : 'Your purchases and their payment/escrow status.'}
            </p>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {['ALL', 'PENDING', 'ESCROW_LOCKED', 'DELIVERED', 'PAID', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : orderStatusLabels[s as keyof typeof orderStatusLabels] ?? s}</option>
            ))}
          </select>
        </div>

        {loading && <ListSkeleton rows={5} />}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && orders.length === 0 && (
          <EmptyState
            icon={ListOrdered}
            title="No orders yet"
            description={user?.role === 'FARMER' ? 'Orders placed for your products will show up here.' : 'Browse the marketplace to place your first order.'}
          />
        )}

        <div className="space-y-3">
          {!loading && orders.map((order, i) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <Card
                className="animate-fade-in transition-colors hover:border-primary/40"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: 'backwards' }}
              >
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.quantity} {order.product.unit} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold text-primary">{formatXlm(order.totalAmount)}</span>
                    <Badge variant={orderStatusVariant(order.status)}>{orderStatusLabels[order.status]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
