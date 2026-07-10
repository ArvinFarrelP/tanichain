'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package, Receipt, ShoppingBag, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardHeader } from '../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../components/layout/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useRequireAuth } from '../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../lib/api';
import { formatXlm } from '../../../lib/format';
import { AnalyticsSummary, ApiItemResponse, PlatformOverview } from '../../../types';

export default function AdminOverviewPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    Promise.all([
      apiClient.get<ApiItemResponse<PlatformOverview>>('/admin/overview'),
      apiClient.get<ApiItemResponse<AnalyticsSummary>>('/analytics/summary'),
    ])
      .then(([overviewRes, summaryRes]) => {
        setOverview(overviewRes.data.data);
        setSummary(summaryRes.data.data);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform-wide analytics and management.</p>
        </div>
        <AdminNav />

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {overview && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card">
              <CardContent className="flex items-center gap-3 py-5">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="font-display text-xl font-semibold">{overview.userCount}</p>
                  <p className="text-xs text-muted-foreground">{overview.farmerCount} farmers · {overview.buyerCount} buyers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="flex items-center gap-3 py-5">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="font-display text-xl font-semibold">{overview.productCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="flex items-center gap-3 py-5">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-display text-xl font-semibold">{overview.orderCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="flex items-center gap-3 py-5">
                <Receipt className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Platform Revenue</p>
                  <p className="font-display text-xl font-semibold text-primary">{formatXlm(overview.totalPlatformRevenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {summary && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue (last 6 months)</CardTitle>
                <CardDescription>Paid orders, platform-wide</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order status breakdown</CardTitle>
                <CardDescription>Current distribution across all orders</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
