'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DashboardHeader } from '../../../../../components/layout/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { ProductForm, ProductFormValues } from '../../../../../components/products/ProductForm';
import { useRequireAuth } from '../../../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../../../lib/api';
import { ApiItemResponse, Product } from '../../../../../types';

export default function EditProductPage() {
  const { isReady } = useRequireAuth(['FARMER']);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    apiClient
      .get<ApiItemResponse<Product>>(`/products/${params.id}`)
      .then((res) => setProduct(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady, params.id]);

  if (!isReady) return null;

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await apiClient.patch(`/products/${params.id}`, {
        ...values,
        harvestDate: values.harvestDate || undefined,
      });
      router.push('/dashboard/products');
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container max-w-xl py-8">
        <Link href="/dashboard/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to my products
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit product</CardTitle>
            <CardDescription>Changes are reflected on the marketplace immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {product && (
              <ProductForm
                defaultValues={{
                  name: product.name,
                  description: product.description ?? '',
                  category: product.category ?? '',
                  quantity: product.quantity,
                  unit: product.unit,
                  pricePerUnit: product.pricePerUnit,
                  harvestDate: product.harvestDate ? product.harvestDate.slice(0, 10) : '',
                }}
                onSubmit={handleSubmit}
                submitLabel="Save changes"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
