import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({

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

    getFollowsByUserId: privateProcedure
    .input(z.object({
      userId: z.string()
    })).query(async ({ ctx, input }) => {
      const userFollows = await ctx.prisma.follow.findMany({
        where: {
          followerId: input.userId,
        },
      })
      return userFollows
    }),

    followUser: privateProcedure
    .input(z.object({
      userId: z.string()
    })).mutation(async ({ ctx, input }) => {
      const followerId = ctx.userId;

      const follow = await ctx.prisma.follow.create({
        data: {
          userId: input.userId,
          followerId: followerId
        }
      });

      return follow;
    }),

    unfollowUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const follow = await ctx.prisma.follow.delete({
        where: {
          id: id
        },
      });

      if (!follow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Follow with that ID not found',
        });
      }


      return follow;
    }),

});