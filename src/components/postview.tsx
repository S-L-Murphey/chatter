import Image from "next/image";
import dayjs from "dayjs"
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "./loading";
import { HeartIcon } from "@heroicons/react/24/outline";
import type { Post } from "@prisma/client";
import { useRouter } from "next/router";

dayjs.extend(relativeTime)

type PostWithUser = {
  post: Post;
  author: {
    username: string;
    id: string;
    profileImageUrl: string;
  };
}

export const PostView = (props: PostWithUser) => {
  const { user } = useUser();
  const { post, author } = props;
  const userId = user?.id ?? '';
  const username = user?.username;
  const router = useRouter()
  const routerId = router.query.slug && router.query.slug;
  const userRouterId = typeof routerId === 'string' ? routerId.replace("@", '') : username!;

  const { data: userByUsername } = api.profile.getUserByUsername.useQuery({ username: userRouterId })

  const officialUserId = userRouterId === username! ? userId : userByUsername?.id

  const { data, isLoading } = api.likes.getUserLikes.useQuery({ userId: officialUserId! });

  const ctx = api.useContext();

  const { mutate, isLoading: isDeleting } = api.posts.deletePost.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
      toast.success("Post successfully deleted.")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete.")
      }
    }
  });

  const userLikes = data !== undefined ? data?.some(f => f?.like.postId === post.id) : false;

  const { mutate: likePost, isLoading: isLiking } = api.likes.likePost.useMutation({
    onSuccess: () => {
      void ctx.likes.getUserLikes.invalidate();
      toast.success("Post Liked!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post!")
      }
    }
  });

  const { mutate: deleteLike, isLoading: processingDelete } = api.likes.deleteLike.useMutation({
    onSuccess: () => {
      void ctx.likes.getUserLikes.invalidate();
      toast.success("Like Deleted!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Delete!")
      }
    }
  });

  if (!data || isLoading) return <LoadingPage />

  const likeToDelete = data.find(f => f.like.postId === post.id)?.like.id

  const isLoggedInUsersLike = data.find(f => f.like.postId === post.id)?.like.authorId === officialUserId;

  const handleLike = () => {
    if (!userLikes) {
      likePost({ postId: post.id, authorId: post.authorId! })
    } else if (userLikes && isLoggedInUsersLike) {
      deleteLike({ likeId: likeToDelete })
    } else {
      toast.error("Unable to delete like.")
    }
  };

  return (
    <div key={post.id} className="px-4 py-4 border-b border-slate-500 flex gap-3 hover:bg-white/10 hover:cursor-pointer">
      <div className="relative overflow-hidden">
        <Image src={author.profileImageUrl} width={64}
          height={64} alt={`@${author.username}'s profile picture.`} className="rounded-full" />
      </div>
      <div className="flex flex-col flex-grow">

        <div className="flex gap-1 items-center">
          <Link href={`/@${author.username}`}>
            <span className="text-slate-200">{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
          {user?.id === author.id && <button className="ml-auto" onClick={() => mutate({ id: post.id })}>{isDeleting ? <LoadingSpinner /> : <EllipsisHorizontalIcon className="h-6 w-6 hover:text-slate-300 rounded-full" />}</button>}
        </div>
        <span>{post.content}</span>

        <button onClick={handleLike} disabled={isLiking || processingDelete}>
          {isLiking || processingDelete ?
            <div className="my-1.5">
              <LoadingSpinner />
            </div>
            :
            <div className="flex gap-3">
              <LikePost likedByUser={userLikes} />
              <span className="pt-1.5">
                <LikeCount postId={post.id} />
              </span>
            </div>}
        </button>
      </div>
    </div>
  )
};

type LikeButtonProps = {
  likedByUser: boolean
}

const LikePost = ({ likedByUser }: LikeButtonProps) => {
  return <button className="flex mt-1.5 transition-colors duration-200" >
    <HeartIcon className={`transition-colors duration-200 h-5 w-5 hover:fill-red-500 ${likedByUser ? 'fill-red-500' : ''}`} />
  </button>
}

type LikeCountProps = {
  postId: string
}

const LikeCount = ({ postId }: LikeCountProps) => {
  const { data, isLoading } = api.likes.getLikesByPostId.useQuery({ postId });
  const likeCount = data?.length

  if (isLoading) return <LoadingSpinner />

  return <div className="text-slate-400 text-sm">{likeCount}</div>
}

