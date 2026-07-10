'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().positive('Must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  pricePerUnit: z.coerce.number().positive('Must be greater than 0'),
  harvestDate: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel: string;
}

export function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { unit: 'kg', ...defaultValues },
  });

  const submit = async (values: ProductFormValues) => {
    setServerError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" placeholder="Premium Arabica Coffee Beans" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          className="flex w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Grown at 1,200m elevation, sun-dried, single origin…"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Coffee" {...register('category')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest date</Label>
          <Input id="harvestDate" type="date" {...register('harvestDate')} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" step="0.01" placeholder="100" {...register('quantity')} />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" placeholder="kg" {...register('unit')} />
          {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerUnit">Price / unit (XLM)</Label>
          <Input id="pricePerUnit" type="number" step="0.0000001" placeholder="2.5" {...register('pricePerUnit')} />
          {errors.pricePerUnit && <p className="text-xs text-destructive">{errors.pricePerUnit.message}</p>}
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
