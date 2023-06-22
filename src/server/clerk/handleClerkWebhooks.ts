import type { ClerkUserObject } from './schema/ClerkUserObjectWebhook.schema';
import { createUserFromClerk } from './events/createUserFromClerk';
import { updateUserFromClerk } from './events/updateUserFromClerk';

export const handleClerkWebhook = async (payload: ClerkUserObject) => {
  if (payload.object !== 'event') return;
  switch (payload.type) {
    case 'user.created':
      return await createUserFromClerk(payload.data);

    case 'user.updated':
      return await updateUserFromClerk(payload.data);
  }
};
