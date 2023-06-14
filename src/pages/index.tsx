import { SignInButton, useUser, useClerk } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { useForm, type SubmitHandler, useController } from "react-hook-form";
import type { Post } from "@prisma/client";

const CreatePost = () => {
  const { user } = useUser();

  const { register, handleSubmit, reset, control } = useForm<Post>();

  const { field } = useController({ name: "content", control })

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
    onSuccess: () => {
      reset({ content: '' })
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

  const onSubmit: SubmitHandler<Post> = data => mutate({ content: data.content });

  if (!user) return <div>No user logged in...</div>

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} width={84}
        height={84} alt="Profile Image" className="rounded-full" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full">
        <input
          placeholder="What's happening?"
          className="bg-transparent grow outline-none text-lg"
          {...register("content")}
          disabled={isPosting}
        />

        {field.value && !isPosting && (<button type="submit" className="w-28 rounded-full text-xl font-bold text-center bg-teal-500 my-7 hover:bg-teal-400 text-slate-700 transition duration-200">Post</button>)}

        {isPosting && <div className="flex justify-center items-center">
          <LoadingSpinner size={20} />
        </div>}
      </form>
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
    <PageLayout>
      <div className="text-2xl font-bold p-2.5 border-b border-slate-500">Home</div>
      <div className="flex border-b border-slate-500 text-slate-300 p-4">
        {!isSignedIn &&
          <div className="flex justify-center">
            <SignInButton />
          </div>}
        {isSignedIn && <CreatePost />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
