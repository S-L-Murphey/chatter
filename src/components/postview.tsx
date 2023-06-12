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

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
  const { user } = useUser();
  const { post, author } = props;

  const ctx = api.useContext();

  const {mutate, isLoading: isDeleting} = api.posts.deletePost.useMutation({
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

  return (
    <div key={post.id} className="p-4 border-b border-stone-500 flex gap-3">
      <Image src={author.profileImageUrl} width={48}
        height={48} alt={`@${author.username}'s profile picture.`} className="rounded-full" />
      <div className="flex flex-col flex-grow">
      
        <div className="flex gap-1 items-center">
          <Link href={`/@${author.username}`}>
            <span className="text-slate-200">{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
          {user?.id === author.id && <button className="ml-auto" onClick={() => mutate({id: post.id})}>{isDeleting ? <LoadingSpinner /> : <EllipsisHorizontalIcon className="h-6 w-6 hover:text-slate-300 rounded-full" />}</button>}
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
};

