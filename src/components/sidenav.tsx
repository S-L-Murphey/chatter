import { HomeIcon, UserIcon, BeakerIcon, BookmarkIcon, EnvelopeIcon, BellIcon, HashtagIcon, BugAntIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";


const NAVIGATION_ITEMS = [
    {
        title: "Home",
        Icon: HomeIcon
    },
    {
        title: "Explore",
        Icon: HashtagIcon
    },
    {
        title: "Notifications",
        Icon: BellIcon
    },
    {
        title: "Messages",
        Icon: EnvelopeIcon
    },
    {
        title: "Bookmarks",
        Icon: BookmarkIcon
    },
    {
        title: "Chatter Blue",
        Icon: BeakerIcon
    },
    {
        title: "Profile",
        Icon: UserIcon
    },
]

export const SideNav = () => {
    return (
        <section className="fixed w-[275px] flex flex-col h-screen items-stretch pr-10 pt-2">
            <Link href="/" className="p-2 py-2 px-6 text-2xl flex">
                <BugAntIcon className="h-8 w-8" /><span></span>
            </Link>
            <div className="flex flex-col items-stretch h-full space-y-4 mt-4">
                {NAVIGATION_ITEMS.map((item) => (
                    <Link className="hover:bg-white/10 transition duration-200 rounded-3xl p-2 py-2 px-6 flex justify-start w-fit items-center space-x-4 text-2xl" href={`/${item.title.toLowerCase()}`} key={item.title}>
                        <div className="h-5 w-5">
                            <item.Icon />
                        </div>
                        <div className="font-bold">
                            {item.title}
                        </div>

                    </Link>

                ))}
                <button className="w-full rounded-full text-2xl font-bold text-center bg-teal-500 m-4 px-6 py-2 hover:bg-teal-400 text-slate-700 transition duration-200">Chat</button>
                <div className="absolute inset-x-0 bottom-0 pb-5"><UserInfoButton /></div>
            </div>
        </section>
    )
};

const UserInfoButton = () => {
    const { user } = useUser();

    const { data } = api.profile.getUserByUsername.useQuery({ username: user?.username! })

    if (!data) return <div>No Data</div>

    return (
        <Link href={`/@${data.username}`}>
            <button className="flex items-center justify-center rounded-full m-4 p-2.5 text-center bg-transparent space-x-3 border border-slate-900 hover:border-slate-700 hover:bg-white/10">
                <Image
                    src={data.profileImageUrl}
                    alt={`${data?.username}'s profile pic`}
                    width={52}
                    height={52}
                    className="rounded-full" />
                <div className="">
                    <div className="text-base font-semibold">{data.username}</div>
                    <div className="text-xs">{`@${data.username}`}</div>
                </div>
                <div><EllipsisHorizontalIcon className="w-5 h-5" /></div>

            </button>
        </Link>

    )
}