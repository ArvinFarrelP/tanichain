import { prisma } from '../../config/db';
import { encryptSecret, decryptSecret } from '../../utils/crypto';
import { generateKeypair, fundWithFriendbot, getBalance } from './stellar.service';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/AppError';

/**
 * Creates a Stellar wallet for a newly registered user, persists the
 * encrypted secret key, and attempts Friendbot funding immediately.
 * This runs as part of the registration flow so every user has a
 * funded wallet from the moment they sign up.
 */
export async function createWalletForUser(userId: string) {
  const { publicKey, secretKey } = generateKeypair();
  const encryptedSecret = encryptSecret(secretKey);

  const wallet = await prisma.wallet.create({
    data: {
      userId,
      publicKey,
      encryptedSecret,
      network: 'TESTNET',
      isFunded: false,
    },
  });

  const funded = await fundWithFriendbot(publicKey);

  if (funded) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { isFunded: true },
    });
  } else {
    logger.warn('Wallet created but Friendbot funding did not succeed yet', { userId, publicKey });
  }

  return { ...wallet, isFunded: funded };
}

export async function getWalletByUserId(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw AppError.notFound('Wallet not found for this user');
  }
  return wallet;
}

export async function getWalletWithBalance(userId: string) {
  const wallet = await getWalletByUserId(userId);
  const balance = await getBalance(wallet.publicKey);
  return { ...wallet, balance };
}

/**
 * Decrypts a wallet's secret key. Only ever used server-side to sign
 * transactions - the secret is never returned to any client.
 */
export async function getDecryptedSecret(userId: string): Promise<string> {
  const wallet = await getWalletByUserId(userId);
  return decryptSecret(wallet.encryptedSecret);
}
