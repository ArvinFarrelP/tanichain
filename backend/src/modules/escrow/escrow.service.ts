import { prisma } from '../../config/db';
import { encryptSecret, decryptSecret } from '../../utils/crypto';
import { generateKeypair, fundWithFriendbot, getBalance } from '../wallet/stellar.service';
import { logger } from '../../utils/logger';

const ESCROW_NAME = 'platform_escrow';

/**
 * Returns the platform escrow wallet, creating and Friendbot-funding it on
 * first use if it doesn't exist yet. This single Stellar account represents
 * the "locked funds" pool in the escrow simulation: buyers pay into it on
 * commitment, and the platform releases funds out of it to farmers once the
 * buyer confirms delivery.
 */
export async function getOrCreateEscrowWallet() {
  let escrow = await prisma.escrowWallet.findUnique({ where: { name: ESCROW_NAME } });

  if (escrow) {
    return escrow;
  }

  const { publicKey, secretKey } = generateKeypair();
  const encryptedSecret = encryptSecret(secretKey);

  escrow = await prisma.escrowWallet.create({
    data: {
      name: ESCROW_NAME,
      publicKey,
      encryptedSecret,
      isFunded: false,
    },
  });

  const funded = await fundWithFriendbot(publicKey);

  if (funded) {
    escrow = await prisma.escrowWallet.update({
      where: { id: escrow.id },
      data: { isFunded: true },
    });
  } else {
    logger.warn('Escrow wallet created but Friendbot funding did not succeed yet', { publicKey });
  }

  return escrow;
}

export async function getEscrowDecryptedSecret(): Promise<string> {
  const escrow = await getOrCreateEscrowWallet();
  return decryptSecret(escrow.encryptedSecret);
}

export async function getEscrowPublicKey(): Promise<string> {
  const escrow = await getOrCreateEscrowWallet();
  return escrow.publicKey;
}

export async function getEscrowBalance(): Promise<string> {
  const escrow = await getOrCreateEscrowWallet();
  return getBalance(escrow.publicKey);
}
