import type { NextApiRequest, NextApiResponse } from 'next';
import type { ClerkUserObject } from '~/server/clerk/schema/ClerkUserObjectWebhook.schema';
import type { Readable } from 'node:stream';
import { handleClerkWebhook } from '~/server/clerk/handleClerkWebhooks';
import { Webhook } from 'svix';

export const config = {
  api: {
    bodyParser: false,
  },
};

const secret = process.env.CLERK_WEBHOOK_SECRET as string;

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Clerk uses Svix under the hood to send requests
// https://docs.svix.com/receiving/verifying-payloads/how
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = (await buffer(req)).toString();
    const headers = req.headers as Record<string, string>;

    let payload: unknown;
    try {
      // https://docs.svix.com/receiving/verifying-payloads/how#nodejs-nextjs
      const webhook = new Webhook(secret);

      // Throws on error, returns the verified content on success
      payload = webhook.verify(body, headers);

    } catch (err: any) {
      console.log(err);
      return res.status(400).send({ message: 'Unauthorized', error: err.message });
    }

    if (!payload) {
      return res.status(400).send({ message: 'Unauthorized' });
    }

    let dbResponse;
    try {
      dbResponse = await handleClerkWebhook(payload as ClerkUserObject);
    } catch (err: any) {
      console.log("err");
      return res.status(400).send({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
    }

    if (dbResponse) {
      return res.status(200).send({ message: 'Success', data: dbResponse });
    }

    return res.status(500).send({ message: 'INTERNAL_SERVER_ERROR' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
  }
}
