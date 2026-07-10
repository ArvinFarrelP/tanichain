'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Package, ShoppingBag, Wallet as WalletIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useRequireAuth } from '../../lib/useRequireAuth';
import { apiClient } from '../../lib/api';
import { formatXlm, orderStatusLabels, orderStatusVariant } from '../../lib/format';
import { AnalyticsSummary, ApiItemResponse, ApiListResponse, Order } from '../../types';

export default function DashboardPage() {
  const { user, isReady } = useRequireAuth();
  const [copied, setCopied] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    if (!isReady) return;
    apiClient
      .get<ApiListResponse<Order>>('/orders', { params: { limit: 5 } })
      .then((res) => setRecentOrders(res.data.data))
      .catch(() => setRecentOrders([]));

    apiClient
      .get<ApiItemResponse<AnalyticsSummary>>('/analytics/summary')
      .then((res) => setSummary(res.data.data))
      .catch(() => setSummary(null));
  }, [isReady]);

  if (!isReady || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </main>
    );
  }

  const handleCopy = () => {
    if (user.wallet?.publicKey) {
      navigator.clipboard.writeText(user.wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <h1 className="mb-6 font-display text-2xl font-semibold">Welcome, {user.fullName.split(' ')[0]}</h1>

        {summary && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card">
              <CardContent className="py-5">
                <p className="text-xs text-muted-foreground">
                  {user.role === 'FARMER' ? 'Revenue earned' : 'Total spent'}
                </p>
                <p className="font-display text-xl font-semibold text-primary">{formatXlm(summary.totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="py-5">
                <p className="text-xs text-muted-foreground">Pending in escrow</p>
                <p className="font-display text-xl font-semibold">{formatXlm(summary.pendingAmount)}</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="py-5">
                <p className="text-xs text-muted-foreground">Completed orders</p>
                <p className="font-display text-xl font-semibold">{summary.paidOrders} / {summary.totalOrders}</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="py-5">
                <p className="text-xs text-muted-foreground">Wallet balance</p>
                <p className="font-display text-xl font-semibold">
                  {summary.walletBalance ? `${Number(summary.walletBalance).toFixed(2)} XLM` : '—'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="stat-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-primary" />
                <CardTitle>Stellar Wallet</CardTitle>
              </div>
              <CardDescription>
                {user.wallet?.isFunded ? 'Funded via Friendbot' : 'Funding in progress'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/30 px-3 py-2">
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {user.wallet?.publicKey ?? 'No wallet yet'}
                </span>
                {user.wallet?.publicKey && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy public key" aria-label="Copy public key">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${user.wallet.publicKey}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="ghost" size="icon" title="View on Stellar Expert" aria-label="View on Stellar Expert">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
              {copied && <p className="mt-2 text-xs text-primary">Copied to clipboard</p>}
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                {user.role === 'FARMER' ? 'Manage your listings and incoming orders.' : 'Browse the marketplace and track your purchases.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {user.role === 'FARMER' ? (
                <Link href="/dashboard/products">
                  <Button className="gap-2"><Package className="h-4 w-4" /> My Products</Button>
                </Link>
              ) : (
                <Link href="/products">
                  <Button className="gap-2"><ShoppingBag className="h-4 w-4" /> Marketplace</Button>
                </Link>
              )}
              <Link href="/dashboard/orders">
                <Button variant="outline">View Orders</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {summary && summary.monthlyRevenue.some((m) => m.revenue > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{user.role === 'FARMER' ? 'Revenue' : 'Spending'} (last 6 months)</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.monthlyRevenue}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/20 px-3 py-2 text-sm hover:border-primary/40"
                >
                  <span>{order.product.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{formatXlm(order.totalAmount)}</span>
                    <Badge variant={orderStatusVariant(order.status)}>{orderStatusLabels[order.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
