import Link from "next/link";
import DBIcon from "./icons/DBIcon";
import SearchIcon from "./icons/Search";
import GraphIcon from "./icons/Graph";
import TargetIcon from "./icons/Target";
import InsightsIcon from "./icons/InsightsIcon";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export type SideNavKeys = "terminal" | "models" | "create-model" | "integrations" | "customization" | "insights"

type IProps = {
    activeKey: SideNavKeys;
}

const SIDENAV_ITEMS = [
    {
        key: "terminal",
        icon: {
            active: <SearchIcon className="text-accent-colour" />,
            inactive: <SearchIcon className="text-light-text-colour" />
        },
        route: "/"
    },
    {
        key: "models",
        icon: {
            active: <GraphIcon className="text-accent-colour" />,
            inactive: <GraphIcon className="text-light-text-colour" />
        },
        route: "/models"
    },
    {
        key: "create-model",
        icon: {
            active: <TargetIcon className="text-accent-colour" />,
            inactive: <TargetIcon className="text-light-text-colour" />
        },
        route: "/create-model"
    },
    {
        key: "integrations",
        icon: {
            active: <DBIcon className="text-accent-colour" />,
            inactive: <DBIcon className="text-light-text-colour" />
        },
        route: "/integrations"
    },
    // {
    //     key: "insights",
    //     icon: {
    //         active: <InsightsIcon className="text-primary" />,
    //         inactive: <InsightsIcon color="#747474" />
    //     },
    //     route: "/insights"
    // },
    // //   {
    // //     key: "customization",
    // //     icon: {
    // //       active: <EyeIcon className="text-primary"/>,
    // //       inactive: <EyeIcon color="#747474" />
    // //     },
    // //     route: "/customization"
    // //   }
]

export const SideNavbar: React.FC<IProps> = ({ activeKey }) => {
    const { data: sessionData } = useSession();

    return (
        <div className="w-16 p-1 border-r border-border-colour flex flex-col gap-4 items-center absolute bg-white h-full">
            <div className="pt-4">
                <label
                    tabIndex={0}
                    className="btn-ghost btn-circle avatar btn"
                    onClick={() => void signOut({ callbackUrl: '/auth/signin' })}
                >
                    <div className="flex flex-col gap-1 items-center bg-blue-card-background-colour rounded-full w-12 h-12 justify-center">
                        {sessionData?.user?.name ? sessionData.user.name[0] : "A"}
                        {/* {active && <div className="w-1 h-1 bg-[#4191F6]" />} */}
                    </div>
                </label>
            </div>
            {SIDENAV_ITEMS.map(({ key, icon, route }) => {
                const active = activeKey === key
                return (
                    <Link href={route} key={key}>
                        <div className={`flex flex-col gap-1 items-center w-12 h-12 justify-center ${active ? "bg-button-active-state" : ""} rounded-full`}>
                            {active ? icon.active : icon.inactive}
                            {/* {active && <div className="w-1 h-1 bg-[#4191F6]" />} */}
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}