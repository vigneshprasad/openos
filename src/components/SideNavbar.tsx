import Link from "next/link";
import DBIcon from "./icons/DBIcon";
import SearchIcon from "./icons/Search";
import GraphIcon from "./icons/Graph";
import TargetIcon from "./icons/Target";
import InsightsIcon from "./icons/InsightsIcon";

export type SideNavKeys = "terminal" | "models" | "create-model" | "integrations" | "customization" | "insights"

type IProps = {
  activeKey: SideNavKeys;
}

const SIDENAV_ITEMS = [
    {
        key: "terminal",
        icon: {
            active: <SearchIcon className="text-primary"/>,
            inactive: <SearchIcon color="#747474" />
        },
        route: "/"
    },
    {
        key: "models",
        icon: {
            active: <GraphIcon className="text-primary"/>,
        inactive: <GraphIcon color="#747474" />
        },
        route: "/models"
    },
    {
        key: "create-model",
        icon: {
            active: <TargetIcon className="text-primary"/>,
            inactive: <TargetIcon color="#747474" />
        },
        route: "/create-model"
    },
    {
        key: "integrations",
        icon: {
            active: <DBIcon className="text-primary"/>,
            inactive: <DBIcon color="#747474" />
        },
        route: "/integrations"
    },
    {
        key: "insights",
        icon: {
            active: <InsightsIcon className="text-primary"/>,
            inactive: <InsightsIcon color="#747474" />
        },
        route: "/insights"
    },
//   {
//     key: "customization",
//     icon: {
//       active: <EyeIcon className="text-primary"/>,
//       inactive: <EyeIcon color="#747474" />
//     },
//     route: "/customization"
//   }
] 

export const SideNavbar: React.FC<IProps> = ({activeKey}) => {
    return (
        <div className="w-16 p-1 bg-white sticky
            border-l-0 border-b-0 flex flex-col gap-4 items-center">
            {SIDENAV_ITEMS.map(({key, icon, route}) => {
                const active = activeKey === key
                return (
                    <Link href={route} key={key}>
                        <div className={`p-3 flex flex-col gap-1 items-center ${active ? "bg-primary/10":"bg-light-theme" } rounded-full`}>
                            {active ? icon.active : icon.inactive}
                            {/* {active && <div className="w-1 h-1 bg-[#4191F6]" />} */}
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}