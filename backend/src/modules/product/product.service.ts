import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logActivity } from '../activity/activity.service';
import { CreateProductInput, UpdateProductInput } from './product.validation';

export async function createProduct(farmerId: string, input: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      farmerId,
      name: input.name,
      description: input.description,
      category: input.category,
      quantity: input.quantity,
      unit: input.unit,
      pricePerUnit: input.pricePerUnit,
      harvestDate: input.harvestDate,
      imageUrl: input.imageUrl,
    },
  });

  await logActivity({ userId: farmerId, action: 'PRODUCT_CREATED', metadata: { productId: product.id, name: product.name } });

  return product;
}

async function getOwnedProductOrThrow(productId: string, farmerId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw AppError.notFound('Product not found');
  }
  if (product.farmerId !== farmerId) {
    throw AppError.forbidden('You do not own this product');
  }
  return product;
}

export async function updateProduct(productId: string, farmerId: string, input: UpdateProductInput) {
  await getOwnedProductOrThrow(productId, farmerId);

  const product = await prisma.product.update({
    where: { id: productId },
    data: input,
  });

  await logActivity({ userId: farmerId, action: 'PRODUCT_UPDATED', metadata: { productId } });

  return product;
}

export async function deleteProduct(productId: string, farmerId: string) {
  await getOwnedProductOrThrow(productId, farmerId);

  const orderCount = await prisma.order.count({ where: { productId } });

  if (orderCount > 0) {
    // Preserve transaction history integrity - archive instead of hard-deleting
    // a product that already has orders attached to it.
    const archived = await prisma.product.update({
      where: { id: productId },
      data: { status: 'ARCHIVED' },
    });
    await logActivity({ userId: farmerId, action: 'PRODUCT_DELETED', metadata: { productId, archived: true } });
    return archived;
  }

  await prisma.product.delete({ where: { id: productId } });
  await logActivity({ userId: farmerId, action: 'PRODUCT_DELETED', metadata: { productId, archived: false } });
  return null;
}

export async function getMyProducts(farmerId: string, params: { page: number; limit: number }) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { farmerId } }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function browseProducts(params: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}) {
  const { page, limit, search, category } = params;
  const skip = (page - 1) * limit;

  const where = {
    status: 'AVAILABLE' as const,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { farmer: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { farmer: { select: { id: true, fullName: true } } },
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }
  return product;
}
