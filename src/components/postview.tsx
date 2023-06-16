import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs"
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";
import { HeartIcon } from "@heroicons/react/24/outline";

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
  const { user } = useUser();
  const { post, author } = props;
  const userId = user?.id ?? '';

  const { data } = api.likes.getUserLikes.useQuery({ userId });

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

  const userLikes = data !== undefined ? data?.some(f => f?.postId === post.id) : false;

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
        toast.error("Failed to post! Too many characters.")
      }
    }
  });

  const handleLike = () => {
    if (!userLikes) {
      likePost({ postId: post.id })
    } else {
      toast.error("You've already liked this post")
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
        
          <button onClick={handleLike} disabled={isLiking}>
            {isLiking ? <div className="my-1.5"><LoadingSpinner /></div> : <LikePost likedByUser={userLikes} />}
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

