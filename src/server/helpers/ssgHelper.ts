import { createServerSideHelpers } from '@trpc/react-query/server';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";

export const generateSSGHelper = () => createServerSideHelpers({
      router: appRouter,
      ctx: { prisma, userId: null },
      transformer: SuperJSON, // optional - adds superjson serialization
    });