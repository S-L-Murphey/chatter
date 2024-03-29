import Image from "next/image";
import dayjs from "dayjs"
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";
import type { Post } from "@prisma/client";
import { useRouter } from "next/router";
import { LikeUnlike } from "./likes/LikeUnlike";

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

  return (
    <div key={post.id} className="px-4 py-4 border-b border-slate-500 flex gap-3 hover:bg-white/10 hover:cursor-pointer">
      <div className="relative overflow-hidden">
        <Image src={author.profileImageUrl} width={64}
          height={64} alt={`@${author.username}'s profile picture.`} className="rounded-full w-[64px] h-[64px]"/>
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
        <LikeUnlike officialUserId={officialUserId} post={post} userId={userId}/>
      </div>
    </div>
  )
};

