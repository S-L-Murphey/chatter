import type { UserJSON } from '@clerk/types';
import { z } from 'zod';

/* From Zod issues #52
 * A way to infer third party types:
 * "This way you can still do validations with parse as you'd expect since z.any() allows any inputs,
 * and the type inference works as expected. 👍"
 * https://github.com/colinhacks/zod/issues/52
 */

const UserObject: z.ZodType<UserJSON> = z.any();

// const EventTypes = ['user.created', 'user.deleted', 'user.updated'];

export type ClerkUserObject = {
  object: string;
  type: string;
  data: UserJSON;
};

export const ClerkUserObjectWebhookSchema = z.object({
  object: z.string(),
  type: z.string(),
  data: UserObject,
});
