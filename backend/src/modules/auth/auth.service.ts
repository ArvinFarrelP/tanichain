import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { createWalletForUser } from '../wallet/wallet.service';
import { logActivity } from '../activity/activity.service';
import { logger } from '../../utils/logger';
import { RegisterInput, LoginInput } from './auth.validation';

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
    },
  });

  // Automatically provision and fund a Stellar wallet for the new user.
  let wallet;
  try {
    wallet = await createWalletForUser(user.id);
  } catch (error) {
    logger.error('Wallet auto-creation failed during registration', {
      userId: user.id,
      error: (error as Error).message,
    });
    // Registration itself should still succeed; the wallet can be retried later.
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  await logActivity({ userId: user.id, action: 'USER_REGISTERED', metadata: { role: user.role } });

  return {
    user: sanitizeUser(user),
    wallet: wallet ? { publicKey: wallet.publicKey, isFunded: wallet.isFunded } : null,
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  await logActivity({ userId: user.id, action: 'USER_LOGIN' });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return sanitizeUser(user);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeUser(user: any) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
