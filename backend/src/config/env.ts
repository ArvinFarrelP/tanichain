import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  wallet: {
    encryptionKey: required('WALLET_ENCRYPTION_KEY'),
  },

  stellar: {
    network: process.env.STELLAR_NETWORK ?? 'TESTNET',
    horizonUrl: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
    friendbotUrl: process.env.STELLAR_FRIENDBOT_URL ?? 'https://friendbot.stellar.org',
    explorerBaseUrl: process.env.STELLAR_EXPLORER_BASE_URL ?? 'https://stellar.expert/explorer/testnet',
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  },
};
