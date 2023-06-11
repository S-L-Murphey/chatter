import { GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string}> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data) return <div>No data</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>{data.username}</div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from '@trpc/react-query/server';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";

export const getStaticProps: GetStaticProps = async (context) => {

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON, // optional - adds superjson serialization
  });

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