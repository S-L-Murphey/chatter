import { HomeIcon, UserIcon, BugAntIcon, EllipsisHorizontalIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";

export const SideNav = () => {
    const { openUserProfile } = useClerk();
    const {user} = useUser();

    if (!user) return <div></div>

    return (
        <nav className="flex flex-col top-0 p-3">
            <Link href="/" className="py-4 pl-5 text-2xl flex">
                <BugAntIcon className="h-10 w-10 text-teal-500" /><span></span>
            </Link>
            <div className="flex flex-col items-start gap-2 whitespace-nowrap ">
                <ul>
                    <li>
                        <Link className="hover:bg-white/10 transition duration-200 rounded-3xl p-2 py-2 px-5 flex items-center space-x-4 text-2xl" href='/'>
                            <div className="h-5 w-5">
                                <HomeIcon />
                            </div>
                            <div className="font-bold">
                                Home
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link className="hover:bg-white/10 transition duration-200 rounded-3xl p-2 py-2 px-5 flex items-center space-x-4 text-2xl" href={user.username ? `/@${user.username}` : `/#`}>
                            <div className="h-5 w-5">
                                <UserIcon />
                            </div>
                            <div className="font-bold">
                                Profile
                            </div>
                        </Link>
                    </li>
                </ul>
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
            <button className=""><EllipsisHorizontalIcon className="w-5 h-5" /></button>

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
                <ArrowRightOnRectangleIcon className="h-10 w-10 lg:w-5 lg:h-5" />
                <div className="font-bold">
                    <SignInButton />
                </div>
            </>
        }
        </div>

    )
}