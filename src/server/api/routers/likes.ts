import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const likesRouter = createTRPCRouter({
    getUserLikes: privateProcedure
        .input(z.object({
            userId: z.string()
        })).query(async ({ ctx, input }) => ctx.prisma.like.findMany({
            where: {
                authorId: input.userId,
            },
        })
        ),

    likePost: privateProcedure
        .input(z.object({
            postId: z.string()
        })).mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;
            // const { success } = await ratelimit.limit(authorId);

            // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

            const like = await ctx.prisma.like.create({
                data: {
                    authorId,
                    postId: input.postId
                }
            });

            return like;
        }),

        deleteLike: privateProcedure
        .input(
            z.object({
              likeId: z.string()
            })
          )
          .mutation(async ({ ctx, input }) => {
            const { likeId } = input;
            const authorId = ctx.userId;

            const like = await ctx.prisma.like.delete({
              where: {
                id: likeId
              },
            });
      
            if (!like) {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Like with that ID not found',
              });
            }
      
      
            return like;
          }),

});