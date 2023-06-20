import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { clerkClient } from "@clerk/nextjs";
import type { Like, Post } from "@prisma/client";

const addUserDataToLikes = async (likes: (Like & {
  post: Post;
})[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: likes.map((like) => like.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return likes.map(like => {
    const author = users.find((user) => user.id === like.authorId)

    if (!author || !author.username) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for like not found."
    })

    return {
      like,
      author: {
        ...author,
        username: author.username
      },
    }
  });
};


export const likesRouter = createTRPCRouter({
    getUserLikes: privateProcedure
        .input(z.object({
            userId: z.string()
        })).query(async ({ ctx, input }) => {
          const userLikes = await ctx.prisma.like.findMany({
            where: {
                likerId: input.userId,
            },
            include: {
              post: true
            }
        })
       const likesWithUserData = addUserDataToLikes(userLikes);
      return likesWithUserData
      }),

    likePost: privateProcedure
        .input(z.object({
            postId: z.string(),
            authorId: z.string()
        })).mutation(async ({ ctx, input }) => {
            const likerId = ctx.userId;

            const like = await ctx.prisma.like.create({
                data: {
                    likerId,
                    postId: input.postId,
                    authorId: input.authorId
                }
            });

            return like;
        }),

        deleteLike: privateProcedure
        .input(
            z.object({
              likeId: z.string().optional()
            })
          )
          .mutation(async ({ ctx, input }) => {
            const { likeId } = input;

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