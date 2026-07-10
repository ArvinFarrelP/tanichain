import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`TaniChain API listening on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`Swagger docs available at /api/docs`);
});

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});
