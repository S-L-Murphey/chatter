import type { PropsWithChildren } from "react";
import { SideNav } from "./sidenav";


export const PageLayout = (props: PropsWithChildren) => {

    return (
        <div className="container flex items-start justify-center mx-auto sm:pr-4">
            <div className="w-1/5 ">
                <SideNav />
            </div>
            <div className="w-3/5 min-h-screen flex-grow border-x border-slate-500">
                {props.children}
            </div>
            <div className="w-1/5"></div>
        </div>
    )
};


//return (
    //     <div className="w-full h-full flex justify-center items-center relative">
    //         <div className="max-w-screen-xl w-full h-full flex relative">
    //             <SideNav />
    //             <main className="ml-72 flex w-full h-full min-h-screen flex-col">
    //                 <div className="h-full w-full md:max-w-2xl  overflow-y-scroll border-x border-slate-500">
    //                     {props.children}
    //                 </div>
    //             </main>
    //         </div>
    //     </div>
    // );