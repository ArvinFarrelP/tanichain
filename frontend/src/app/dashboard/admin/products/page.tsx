'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, downloadFile, getApiErrorMessage } from '../../../../lib/api';
import { formatXlm } from '../../../../lib/format';
import { ApiListResponse, Product, ProductStatus } from '../../../../types';

const STATUS_OPTIONS: Array<ProductStatus | 'ALL'> = ['ALL', 'AVAILABLE', 'SOLD_OUT', 'ARCHIVED'];

export default function AdminProductsPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    apiClient
      .get<ApiListResponse<Product>>('/admin/products', {
        params: { search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 100 },
      })
      .then((res) => setProducts(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady, search, status]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/admin/export/products', 'tanichain-products.csv');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Every product listing across all farmers.</p>
        </div>
        <AdminNav />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search product name…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | 'ALL')}
              className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
            </select>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>

        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <div className="min-w-[180px] flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">by {product.farmer?.fullName ?? 'Unknown'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{product.quantity} {product.unit} in stock</span>
                  <span className="font-display font-semibold text-primary">{formatXlm(product.pricePerUnit)}</span>
                  <Badge variant={product.status === 'AVAILABLE' ? 'success' : product.status === 'SOLD_OUT' ? 'warning' : 'secondary'}>
                    {product.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
