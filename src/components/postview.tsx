import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs"
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-4 border-b border-stone-500 flex gap-3">
      <Image src={author.profileImageUrl} width={48}
        height={48} alt={`@${author.username}'s profile picture.`} className="rounded-full" />
      <div className="flex flex-col">
        <div className="flex gap-1"><Link href={`/@${author.username}`}>
          <span className="text-slate-200">{`@${author.username}`}</span>
        </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span>{post.content}</span>
      </div>

    </div>
  )
};