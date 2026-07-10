'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Leaf, Loader2, Minus, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { apiClient, getApiErrorMessage } from '../../../lib/api';
import { formatDate, formatXlm } from '../../../lib/format';
import { useAuthStore } from '../../../store/authStore';
import { ApiItemResponse, Order, Product } from '../../../types';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hydrate, isHydrated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiClient
      .get<ApiItemResponse<Product>>(`/products/${params.id}`)
      .then((res) => setProduct(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [params.id]);

  const canBuy = isHydrated && user && (user.role === 'BUYER' || user.role === 'COOPERATIVE');
  const isOwnProduct = user && product && product.farmerId === user.id;

  const handleBuy = async () => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post<ApiItemResponse<Order>>('/orders', {
        productId: product.id,
        quantity,
      });
      router.push(`/dashboard/orders/${res.data.data.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Link href="/products"><Button variant="outline">Back to marketplace</Button></Link>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen">
      <nav className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            TaniChain
          </Link>
        </div>
      </nav>

      <section className="container max-w-2xl py-10">
        <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <Badge variant={product.status === 'AVAILABLE' ? 'success' : 'secondary'}>{product.status}</Badge>
            </div>
            <CardDescription>
              {product.farmer?.fullName ? `Sold by ${product.farmer.fullName}` : null}
              {product.category ? ` · ${product.category}` : ''}
              {product.harvestDate ? ` · Harvested ${formatDate(product.harvestDate)}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

            <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/30 p-4">
              <div>
                <p className="font-display text-2xl font-semibold text-primary">{formatXlm(product.pricePerUnit)}</p>
                <p className="text-xs text-muted-foreground">per {product.unit} · {product.quantity} {product.unit} available</p>
              </div>
            </div>

            {isOwnProduct && (
              <p className="text-sm text-muted-foreground">This is your own product listing.</p>
            )}

            {!isOwnProduct && product.status === 'AVAILABLE' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Quantity ({product.unit})</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!isOwnProduct && (
              <p className="font-display text-lg">
                Total: <span className="text-primary">{formatXlm(product.pricePerUnit * quantity)}</span>
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          {!isOwnProduct && product.status === 'AVAILABLE' && (
            <CardFooter>
              <Button className="w-full" onClick={handleBuy} disabled={submitting || !canBuy && !!user}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {!user ? 'Log in to purchase' : canBuy ? 'Commit to purchase' : 'Farmers cannot purchase'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </section>
    </main>
  );
}
