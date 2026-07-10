'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ProductForm, ProductFormValues } from '../../../../components/products/ProductForm';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../../lib/api';

export default function NewProductPage() {
  const { isReady } = useRequireAuth(['FARMER']);
  const router = useRouter();

  if (!isReady) return null;

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await apiClient.post('/products', {
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
            <CardTitle>List a new product</CardTitle>
            <CardDescription>Buyers will see this listed on the marketplace once created.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
