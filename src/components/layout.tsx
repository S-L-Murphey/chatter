import type { PropsWithChildren } from "react";
import { SideNav } from "./sidenav";


export const PageLayout = (props: PropsWithChildren) => {

    return (
        <div className="w-full h-full flex justify-center items-center relative">
            <div className="max-w-screen-xl w-full h-full flex relative">
                <SideNav />
                <main className="ml-[275px]">
                    <div className="h-full w-full md:max-w-2xl border-x border-stone-500 overflow-y-scroll">
                        {props.children}
                    </div>
                </main>
            </div>
        </div>
    );
};