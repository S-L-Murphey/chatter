import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { useState } from "react";

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
  const [postState, setPostState] = useState(true);
  const [likeState, setLikeState] = useState(false);

  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data) return <div>No data</div>

  const handleTweetView = () => {
    if (likeState) {
      setLikeState(false)
      setPostState(true)
    }
  };
  const handleLikeView = () => {
    if (postState) {
      setLikeState(true)
      setPostState(false)
    }
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
            className="absolute bottom-0 left-0 -mb-[64px] rounded-full ml-4 border-2 border-black bg-black" />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? data.username ?? "unknown"
          }`}</div>
        <div className="flex justify-evenly py-2.5 text-white/70 font-bold">
          <button className={`hover:text-teal-500 hover:underline hover:font-extrabold transition-colors duration-200 ${postState && `underline`}`} onClick={handleTweetView}>Tweets</button>

          <button className={`hover:text-teal-500 hover:underline hover:font-extrabold transition-colors duration-200 ${!postState && `underline`}`} onClick={handleLikeView}>Likes</button>
        </div>
        <div className="w-full border-b border-slate-400" />
        {postState ? <ProfileFeed userId={data.id} /> : <LikeFeed userId={data.id} />}
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

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has no likes yet.</div>

  return <div className="flex flex-col">
    {transformedLikes?.map(fullPost => (<PostView {...fullPost} key={fullPost.post?.id} />
    ))}
  </div>
}