import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { useForm, SubmitHandler, useController } from "react-hook-form";
import { Post } from "@prisma/client";

const CreatePost = () => {
  const { user } = useUser();

  const { register, handleSubmit, watch, formState: { errors }, reset, control } = useForm<Post>();

  const { field } = useController({name: "content", control})

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
          placeholder="Send a chat!"
          className="bg-transparent grow outline-none"
          {...register("content")}
          disabled={isPosting}
        />

        {field.value !== "" && !isPosting && (<button type="submit">Post</button>)}

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
      <div className="flex border-b border-stone-500 text-slate-300 p-4">
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
