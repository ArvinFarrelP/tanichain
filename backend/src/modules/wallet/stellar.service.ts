import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/AppError';

const server = new Horizon.Server(env.stellar.horizonUrl);
const NETWORK_PASSPHRASE = env.stellar.network === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC;

export interface StellarKeypair {
  publicKey: string;
  secretKey: string;
}

export interface StellarTxResult {
  hash: string;
  ledger: number;
  explorerUrl: string;
}

/**
 * Generates a brand-new Stellar keypair. Called automatically on user registration.
 */
export function generateKeypair(): StellarKeypair {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Funds a newly created wallet using the Stellar Testnet Friendbot.
 * This is what gives brand-new accounts their initial XLM balance.
 */
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${env.stellar.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);

    if (!response.ok) {
      const body = await response.text();
      logger.error('Friendbot funding failed', { publicKey, body });
      return false;
    }

    logger.info('Friendbot funded wallet', { publicKey });
    return true;
  } catch (error) {
    logger.error('Friendbot request error', { publicKey, error: (error as Error).message });
    return false;
  }
}

/**
 * Fetches the native XLM balance for a given public key.
 */
export async function getBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === 'native');
    return native?.balance ?? '0';
  } catch (error) {
    logger.warn('Unable to load account balance (account may not be funded yet)', {
      publicKey,
      error: (error as Error).message,
    });
    return '0';
  }
}

/**
 * Builds, signs, and submits a native XLM payment from one account to another.
 * Used for Payment Commitments and Escrow deposit/release events.
 */
export async function submitPayment(params: {
  senderSecret: string;
  receiverPublicKey: string;
  amount: string;
  memo?: string;
}): Promise<StellarTxResult> {
  const { senderSecret, receiverPublicKey, amount, memo } = params;

  const senderKeypair = Keypair.fromSecret(senderSecret);
  const senderAccount = await server.loadAccount(senderKeypair.publicKey());

  const transactionBuilder = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: receiverPublicKey,
        asset: Asset.native(),
        amount,
      }),
    )
    .setTimeout(60);

  if (memo) {
    transactionBuilder.addMemo(Memo.text(memo.slice(0, 28)));
  }

  const transaction = transactionBuilder.build();
  transaction.sign(senderKeypair);

  try {
    const result = await server.submitTransaction(transaction);
    return {
      hash: result.hash,
      ledger: result.ledger,
      explorerUrl: `${env.stellar.explorerBaseUrl}/tx/${result.hash}`,
    };
  } catch (error) {
    const stellarError = error as { response?: { data?: unknown } };
    logger.error('Stellar payment submission failed', {
      error: stellarError.response?.data ?? (error as Error).message,
    });
    throw AppError.badRequest('Stellar transaction failed. The sending wallet may be unfunded or the network unreachable.');
  }
}

export function buildExplorerUrl(hash: string): string {
  return `${env.stellar.explorerBaseUrl}/tx/${hash}`;
}
