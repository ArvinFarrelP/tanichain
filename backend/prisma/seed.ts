/**
 * TaniChain demo seed script.
 *
 * Reuses the existing service layer (auth, product, order, payment) instead
 * of writing raw Prisma calls, so seeded data goes through exactly the same
 * logic as real usage - including real Stellar Testnet wallet creation,
 * Friendbot funding, and (for the completed order) two real Horizon
 * transactions for the escrow deposit and release.
 *
 * Run with: npm run seed
 * Safe to re-run - exits early if demo data already exists.
 */
import { prisma } from '../src/config/db';
import { registerUser } from '../src/modules/auth/auth.service';
import { createProduct } from '../src/modules/product/product.service';
import { createOrder } from '../src/modules/order/order.service';
import { commitPayment, markDelivered, confirmDeliveryAndRelease } from '../src/modules/payment/payment.service';
import { logger } from '../src/utils/logger';

const DEMO_PASSWORD = 'Demo12345!';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@tanichain.demo' } });
  if (existing) {
    logger.info('Demo data already present - skipping seed. Delete the demo users to reseed.');
    return;
  }

  logger.info('Seeding TaniChain demo data (this creates real Stellar Testnet wallets, please be patient)...');

  const admin = await registerUser({
    email: 'admin@tanichain.demo',
    password: DEMO_PASSWORD,
    fullName: 'Admin Demo',
    role: 'ADMIN',
  });
  await prisma.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  logger.info('Created admin user', { email: 'admin@tanichain.demo' });

  const farmer1 = await registerUser({
    email: 'farmer.siti@tanichain.demo',
    password: DEMO_PASSWORD,
    fullName: 'Siti Aminah',
    phone: '+62 812 1111 2222',
    role: 'FARMER',
  });
  logger.info('Created farmer', { email: 'farmer.siti@tanichain.demo' });

  const farmer2 = await registerUser({
    email: 'farmer.budi@tanichain.demo',
    password: DEMO_PASSWORD,
    fullName: 'Budi Santoso',
    phone: '+62 812 3333 4444',
    role: 'FARMER',
  });
  logger.info('Created farmer', { email: 'farmer.budi@tanichain.demo' });

  const buyer1 = await registerUser({
    email: 'buyer.maria@tanichain.demo',
    password: DEMO_PASSWORD,
    fullName: 'Maria Christina',
    phone: '+62 813 5555 6666',
    role: 'BUYER',
  });
  logger.info('Created buyer', { email: 'buyer.maria@tanichain.demo' });

  const buyer2 = await registerUser({
    email: 'buyer.andi@tanichain.demo',
    password: DEMO_PASSWORD,
    fullName: 'Andi Wijaya',
    phone: '+62 813 7777 8888',
    role: 'BUYER',
  });
  logger.info('Created buyer', { email: 'buyer.andi@tanichain.demo' });

  const products = await Promise.all([
    createProduct(farmer1.user.id, {
      name: 'Premium Arabica Coffee Beans',
      description: 'Grown at 1,200m elevation in the highlands, sun-dried, single origin.',
      category: 'Coffee',
      quantity: 500,
      unit: 'kg',
      pricePerUnit: 2.5,
      harvestDate: new Date('2026-05-15'),
    }),
    createProduct(farmer1.user.id, {
      name: 'Organic Jasmine Rice',
      description: 'Fragrant long-grain rice, pesticide-free, hand-harvested.',
      category: 'Rice',
      quantity: 1000,
      unit: 'kg',
      pricePerUnit: 1.2,
      harvestDate: new Date('2026-06-01'),
    }),
    createProduct(farmer2.user.id, {
      name: 'Cavendish Bananas',
      description: 'Sweet, export-grade bananas from the lowland plantations.',
      category: 'Fruit',
      quantity: 800,
      unit: 'kg',
      pricePerUnit: 0.8,
      harvestDate: new Date('2026-06-20'),
    }),
    createProduct(farmer2.user.id, {
      name: 'Raw Forest Honey',
      description: 'Wild-harvested honey from the foothill apiaries.',
      category: 'Honey',
      quantity: 150,
      unit: 'kg',
      pricePerUnit: 8.0,
      harvestDate: new Date('2026-04-10'),
    }),
  ]);
  logger.info(`Created ${products.length} products`);

  // Order 1: still pending, no payment committed yet.
  await createOrder(buyer1.user.id, { productId: products[0].id, quantity: 20 });
  logger.info('Created a PENDING order');

  // Order 2: payment committed and escrow-locked, awaiting delivery.
  const order2 = await createOrder(buyer2.user.id, { productId: products[2].id, quantity: 50 });
  await commitPayment(order2.id, buyer2.user.id);
  logger.info('Created an ESCROW_LOCKED order (real Stellar Testnet deposit transaction)');

  // Order 3: full lifecycle completed - committed, delivered, confirmed, paid.
  const order3 = await createOrder(buyer1.user.id, { productId: products[1].id, quantity: 100 });
  await commitPayment(order3.id, buyer1.user.id);
  await markDelivered(order3.id, farmer1.user.id);
  await confirmDeliveryAndRelease(order3.id, buyer1.user.id);
  logger.info('Created a fully PAID order (real Stellar Testnet deposit + release transactions)');

  logger.info('Demo seed complete.');
  logger.info('Login with any of these accounts (password: Demo12345!):');
  logger.info('  admin@tanichain.demo (ADMIN)');
  logger.info('  farmer.siti@tanichain.demo / farmer.budi@tanichain.demo (FARMER)');
  logger.info('  buyer.maria@tanichain.demo / buyer.andi@tanichain.demo (BUYER)');
}

main()
  .catch((error) => {
    logger.error('Seed failed', { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
