import { prisma } from '~/server/db';
import type { UserJSON } from '@clerk/types';
import { getPrimaryEmailAddress } from '../getPrimaryEmailAddress';

export const updateUserFromClerk = async (user: UserJSON): Promise<string> => {
  const userUpdated = await prisma.author.update({
    where: {
      clerkId: user.id,
    },
    data: {
      clerkId: user.id,
      email: getPrimaryEmailAddress(user),
      username: user?.username,
      createdAt: new Date(user?.created_at),
    },
  });

  if (!userUpdated) {
    throw new Error(`INTERNAL_SERVER_ERROR: User update failed: ${user.id}`);
  }

  return user.id;
};
