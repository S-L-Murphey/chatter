import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has no posts yet.</div>

  return <div className="flex flex-col">
    {data.map(fullPost => (<PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { user } = useUser();
  const [likeState, setLikeState] = useState(false);

  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data) return <div>No data</div>

  const handleViewChange = () => {
    setLikeState(!likeState);
  };

  return (
    <>
      <Head>
        <title>{data.username ?? data.username}</title>
      </Head>
      <PageLayout>
        <div className=" bg-slate-600 h-36 relative">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? data.username ?? "unknown"
              }'s profile pic`}
            height={128}
            width={128}
            className="absolute bottom-0 left-0 -mb-[64px] rounded-full ml-4 border-2 border-black bg-black w-[128px] h-[128px]" />
        </div>
        <div className="h-[64px]" />
        <div className="flex justify-between py-7">
          <div className="pl-4 text-2xl font-bold">{`@${data.username ?? data.username ?? "unknown"
            }`}</div>
          {user?.username !== data.username ?
            <FollowUnfollow data={data} />
            : <div></div>
          }
        </div>
        <div className="flex justify-evenly py-2.5 text-white/70 font-bold">
          <button className={`hover:text-teal-500 hover:underline hover:font-extrabold transition-colors duration-200 ${likeState ? 'underline' : ''}`} onClick={handleViewChange}>Tweets</button>

          <button className={`hover:text-teal-500 hover:underline hover:font-extrabold transition-colors duration-200 ${!likeState ? 'underline' : ''}`} onClick={handleViewChange}>Likes</button>
        </div>
        <div className="w-full border-b border-slate-400" />
        {likeState ? <ProfileFeed userId={data.id} /> : <LikeFeed userId={data.id} />}
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {

  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", '')

  await helpers.profile.getUserByUsername.prefetch({ username: username })

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    }
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;

const LikeFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.likes.getUserLikes.useQuery({ userId: props.userId });

  const transformedLikes = data?.map(({ like, author }) => ({
    author,
    post: like.post,
  }));
  
  console.log(transformedLikes)

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div className="p-3">User has no likes yet...</div>

  return <div className="flex flex-col">
    {transformedLikes?.map(fullPost => (<PostView {...fullPost} key={fullPost.post?.id} />
    ))}
  </div>
};

type FollowButtonProps = {
  data: {
    id: string;
    username: string | null;
    profileImageUrl: string;
  }
}


const FollowUnfollow = ({ data }: FollowButtonProps) => {

  const { user } = useUser();
  const userId = user?.id ?? '';

  const ctx = api.useContext();

  const { mutate: followUser, isLoading: sendingFollow } = api.profile.followUser.useMutation({
    onSuccess: () => {
      void ctx.profile.getFollowsByUserId.invalidate();
      toast.success(`Now following ${data.username!}!`)
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to follow!")
      }

    }
  });

  const { mutate: unfollowUser, isLoading: deletingFollow } = api.profile.unfollowUser.useMutation({
    onSuccess: () => {
      void ctx.profile.getFollowsByUserId.invalidate();
      toast.success(`No longer following ${data.username!}!`)
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to unfollow!")
      }

    }
  });

  const { data: userFollows } = api.profile.getFollowsByUserId.useQuery({ userId: userId })

  if (!data) return <LoadingSpinner />

  const isFollowingSlug = userFollows?.find(f => f.userId === data.id)

  return (
    <>
      {isFollowingSlug ?
        <button className="mr-8 px-6 rounded-full border border-slate-100 font-semibold hover:bg-teal-500 hover:text-slate-800 hover:border-slate-800" onClick={() => unfollowUser({ id: isFollowingSlug.id })}>
          <span className="flex items-center">Unfollow
          </span>
        </button>
        :
        <button className="mr-8 px-6 rounded-full border border-slate-100 font-semibold hover:bg-teal-500 hover:text-slate-800 hover:border-slate-800" onClick={() => followUser({ userId: data.id })}>
          <span className="flex items-center"><PlusIcon className="h-5 w-5" />Follow
          </span>
        </button>
      }
    </>
  )
}