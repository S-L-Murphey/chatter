import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map(post => {
    const author = users.find((user) => user.id === post.authorId)

    if (!author || !author.username) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for post not found."
    })

    return {
      post,
      author: {
        ...author,
        username: author.username
      },
    }
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    ).query(async ({ ctx, input }) => ctx.prisma.post.findMany({
      where: {
        authorId: input.userId,
      },
      take: 100,
      orderBy: {
        createdAt: 'desc'
      }
    }).then(addUserDataToPosts)
    ),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id }
      });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0]
    }),

  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(200)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        }
      });

      return post;
    }),

  deletePost: privateProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.delete({
        where: {
          id: input.id
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post with that ID not found',
        });
      }


      return post;
    }),

    infinitePosts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
    }))
    .query(async ({input, ctx}) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await ctx.prisma.post.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'asc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    })

});