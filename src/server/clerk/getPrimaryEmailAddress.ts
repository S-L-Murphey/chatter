import type { UserJSON } from '@clerk/types';

export function getPrimaryEmailAddress(user: UserJSON) {
  return user.email_addresses.find(
    (emailAddress) => emailAddress.id === user.primary_email_address_id
  )?.email_address;
}