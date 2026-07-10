import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logActivity } from '../activity/activity.service';
import { UpdateProfileInput, ChangePasswordInput } from './user.validation';

const SALT_ROUNDS = 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeUser(user: any) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    },
    include: { wallet: true },
  });

  await logActivity({ userId, action: 'PROFILE_UPDATED' });

  return sanitizeUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const validPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!validPassword) {
    throw AppError.unauthorized('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await logActivity({ userId, action: 'PASSWORD_CHANGED' });
}
