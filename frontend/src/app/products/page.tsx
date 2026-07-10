'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Search, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { GridSkeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { apiClient, getApiErrorMessage } from '../../lib/api';
import { formatXlm } from '../../lib/format';
import { useAuthStore } from '../../store/authStore';
import { Product, ApiListResponse } from '../../types';

export default function MarketplacePage() {
  const { user, hydrate, isHydrated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiClient
      .get<ApiListResponse<Product>>('/products', {
        params: { search: search || undefined, category: category || undefined, limit: 50 },
        signal: controller.signal,
      })
      .then((res) => {
        setProducts(res.data.data);
        if (!category) {
          setCategories(Array.from(new Set(res.data.data.map((p) => p.category).filter(Boolean))) as string[]);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search, category]);

  return (
    <main className="min-h-screen">
      <nav className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            TaniChain
          </Link>
          <div className="flex items-center gap-3">
            {isHydrated && user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link href="/register"><Button size="sm">Get started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="container py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Fresh harvests, direct from verified farmers.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {categories.length > 0 && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading && <GridSkeleton cards={6} />}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={ShoppingBag}
            title="No products found"
            description="Try a different search term or check back soon as farmers list new harvests."
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && products.map((product, i) => (
            <Card
              key={product.id}
              className="flex flex-col animate-fade-in"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: 'backwards' }}
            >
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>
                  {product.farmer?.fullName ? `by ${product.farmer.fullName}` : null}
                  {product.category ? ` · ${product.category}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                <p className="font-display text-lg font-semibold text-primary">
                  {formatXlm(product.pricePerUnit)} <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground">{product.quantity} {product.unit} available</p>
              </CardContent>
              <CardFooter>
                <Link href={`/products/${product.id}`} className="w-full">
                  <Button className="w-full">View details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
