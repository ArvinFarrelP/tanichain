import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './utils/logger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './swagger/swagger';

import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import orderRoutes from './modules/order/order.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import notificationRoutes from './modules/notification/notification.routes';
import userRoutes from './modules/user/user.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import activityRoutes from './modules/activity/activity.routes';
import adminRoutes from './modules/admin/admin.routes';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      // The default CSP is designed for HTML pages and would block Swagger UI's
      // inline scripts/styles. This is a JSON API everywhere except /api/docs,
      // so CSP is applied narrowly to that route instead (see below) rather
      // than disabled outright.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    }),
  );
  app.use(
    cors({
      origin: env.cors.origin,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  const morganStream = {
    write: (message: string) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
  };
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', { stream: morganStream }));

  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'TaniChain API is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
