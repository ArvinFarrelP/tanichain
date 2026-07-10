'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { DashboardHeader } from '../../../components/layout/DashboardHeader';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { GridSkeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useRequireAuth } from '../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../lib/api';
import { formatXlm } from '../../../lib/format';
import { ApiListResponse, Product } from '../../../types';

export default function MyProductsPage() {
  const { isReady } = useRequireAuth(['FARMER']);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    apiClient
      .get<ApiListResponse<Product>>('/products/mine', { params: { limit: 50 } })
      .then((res) => setProducts(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isReady) loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? If it already has orders, it will be archived instead.')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">My Products</h1>
            <p className="text-sm text-muted-foreground">Manage your product listings and inventory.</p>
          </div>
          <Link href="/dashboard/products/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Product</Button>
          </Link>
        </div>

        {loading && <GridSkeleton cards={3} />}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && products.length === 0 && (
          <EmptyState
            icon={Package}
            title="You haven't listed any products yet"
            description="Create your first product listing so buyers can find and purchase it."
            action={{ label: 'Create product', onClick: () => (window.location.href = '/dashboard/products/new') }}
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{product.name}</CardTitle>
                  <Badge variant={product.status === 'AVAILABLE' ? 'success' : product.status === 'SOLD_OUT' ? 'warning' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
                <CardDescription>{product.category ?? 'Uncategorized'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-display text-lg font-semibold text-primary">
                  {formatXlm(product.pricePerUnit)} <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground">{product.quantity} {product.unit} in stock</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
