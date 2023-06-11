import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";


dayjs.extend(relativeTime)

const CreatePost = () => {
  const { user } = useUser();
  // TODO: gut all this and implement zod react hook form
  const [input, setInput] = useState('');

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
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

  if (!user) return <div>No user logged in...</div>

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} width={84}
        height={84} alt="Profile Image" className="rounded-full" />
      <input
        placeholder="Send a chat!"
        className="bg-transparent grow outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (<button onClick={() => mutate({ content: input })}>Post</button>
      )}

      {isPosting && <div className="flex justify-center items-center">
        <LoadingSpinner size={20} />
      </div>}
    </div>
  )
};


type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = (props: PostWithUser) => {
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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong...</div>

  return (
    <div className="flex flex-col text-slate-400">
      {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Only using this to make sure this fetches early
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />

  return (
    <>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full md:max-w-2xl border-x border-stone-500">
          <div className="flex border-b border-stone-500 text-slate-300 p-4">{!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}{isSignedIn && <CreatePost />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
