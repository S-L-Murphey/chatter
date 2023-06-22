import { prisma } from '~/server/db';
import type { UserJSON } from '@clerk/types';
import { getPrimaryEmailAddress } from '../getPrimaryEmailAddress';
import { updateUserFromClerk } from './updateUserFromClerk';

export const createUserFromClerk = async (user: UserJSON): Promise<string> => {
  const userEmail = getPrimaryEmailAddress(user);

  if (!userEmail) {
    throw new Error(
      `INTERNAL_SERVER_ERROR: No email address provided from Clerk for User ID ${user.id}`
    );
  }

  let userRecord = await prisma.author.findFirst({
    where: {
      OR: [{ clerkId: user.id }, { email: userEmail }],
    },
  });

  if (userRecord) return updateUserFromClerk(user);

  userRecord = await prisma.author.create({
    data: {
      clerkId: user.id,
      email: userEmail,
      username: user?.username,
      createdAt: new Date(user?.created_at),
    },
  });

  if (!userRecord) {
    throw new Error(`INTERNAL_SERVER_ERROR: User creation failed: ${user.id}`);
  }



  return user.id;
};
