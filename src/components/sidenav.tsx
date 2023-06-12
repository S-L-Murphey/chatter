import { HomeIcon, UserIcon, BeakerIcon, BookmarkIcon, EnvelopeIcon, BellIcon, HashtagIcon, BugAntIcon } from "@heroicons/react/24/solid"
import Link from "next/link"


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
        <section className="fixed w-[275px] flex flex-col h-screen items-stretch ">
            <Link href="/" className="p-2 py-2 px-6 text-2xl flex">
                <BugAntIcon className="h-8 w-8" /><span>Chatter</span>
            </Link>
            <div className="flex flex-col items-stretch h-full space-y-4 mt-4">
                {NAVIGATION_ITEMS.map((item) => (
                    <Link className="hover:bg-slate-700 transition duration-200 rounded-3xl p-2 py-2 px-6 flex justify-start w-fit items-center space-x-4 text-2xl" href={`/${item.title.toLowerCase()}`} key={item.title}>
                        <div className="h-5 w-5">
                            <item.Icon />
                        </div>
                        <div>
                            {item.title}
                        </div>

                    </Link>

                ))}
                <button className="w-full rounded-full text-2xl text-center bg-teal-500 m-4 px-6 py-2 hover:bg-teal-400 text-slate-700 transition duration-200">Chat</button>
                <div className="">At the bottom</div>
            </div>
        </section>
    )
}