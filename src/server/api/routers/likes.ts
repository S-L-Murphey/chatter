import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const likesRouter = createTRPCRouter({

    getUserByUsername: publicProcedure.input(z.object({
        username: z.string()
    })).query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username],
        });

        if (!user) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found",
            })
        }

        return filterUserForClient(user);
    }),

    getUserLikes: privateProcedure
    .input(z.object({
        userId: z.string()
    })).query(async ({ ctx, input }) => ctx.prisma.like.findMany({
        where: {
          authorId: input.userId,
        },
      })
      ),

});