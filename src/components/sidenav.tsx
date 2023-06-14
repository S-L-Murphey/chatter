import { HomeIcon, UserIcon, BugAntIcon, EllipsisHorizontalIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";


const NAVIGATION_ITEMS = [
    {
        title: "Home",
        Icon: HomeIcon
    },
    {
        title: "Profile",
        Icon: UserIcon
    },
]

export const SideNav = () => {
    const { openUserProfile } = useClerk();

    return (
        <nav className="flex flex-col top-0 py-4 px-2 ">
            <Link href="/" className="p-5 text-2xl flex">
                <BugAntIcon className="h-10 w-10 text-teal-500" /><span></span>
            </Link>
            <div className="flex flex-col items-start gap-2 whitespace-nowrap ">
                {NAVIGATION_ITEMS.map((item) => (
                    <Link className="hover:bg-white/10 transition duration-200 rounded-3xl p-2 py-2 px-5 flex items-center space-x-4 text-2xl" href={`/${item.title.toLowerCase()}`} key={item.title}>
                        <div className="h-5 w-5">
                            <item.Icon />
                        </div>
                        <div className="font-bold">
                            {item.title}
                        </div>
                    </Link>
                ))}
                <SideLogInLogOut />
                <button className="sticky inset-x-24 bottom-0 pb-5" onClick={() => openUserProfile()}>
                    <UserInfoButton />
                </button>

            </div>
        </nav>
    )
};

const UserInfoButton = () => {
    const { user } = useUser();
    const username = user?.username ?? "";

    const { data } = api.profile.getUserByUsername.useQuery({ username });

    if (!data || !data.username) return <div>No Data</div>;

    return (
            <button className="flex items-center justify-center rounded-full p-2.5 text-center bg-transparent space-x-3 border border-slate-900 hover:border-slate-700 hover:bg-white/10">
                <Image
                    src={data.profileImageUrl}
                    alt={`${data?.username}'s profile pic`}
                    width={52}
                    height={52}
                    className="rounded-full" />
                <div className="">
                    <div className="text-base font-semibold pl-1">{data.username}</div>
                    <div className="text-xs pl-1">{`@${data.username}`}</div>
                </div>
                <button><EllipsisHorizontalIcon className="w-5 h-5" /></button>

            </button>
    )
};

const SideLogInLogOut = () => {
    const { user } = useUser();
    return (
        <div className="rounded-3xl p-2 py-2 px-5 flex items-center space-x-4 text-2xl hover:bg-white/10 transition duration-200">{user ?
            <>
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <button className="font-bold">
                    <SignOutButton />
                </button></>
            :
            <>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <div className="font-bold">
                    <SignInButton />
                </div>
            </>
        }
        </div>

    )
}