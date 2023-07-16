import Link from "next/link";
import IntegrationsIcon from "./icons/Integrations"
import TerminalIcon from "./icons/Terminal"
import CustomizationIcon from "./icons/Customization";
import DBIcon from "./icons/DBIcon";

export type SideNavKeys = "terminal" | "model" | "integrations" | "customization"

type IProps = {
  activeKey: SideNavKeys;
}

const SIDENAV_ITEMS = [
  {
    key: "terminal",
    icon: {
      active: <TerminalIcon className="text-primary"/>,
      inactive: <TerminalIcon color="#747474" />
    },
    route: "/"
  },
  {
    key: "model",
    icon: {
      active: <DBIcon className="text-primary"/>,
      inactive: <DBIcon color="#747474" />
    },
    route: "/model"
  },
  {
    key: "integrations",
    icon: {
      active: <IntegrationsIcon className="text-primary" />,
      inactive: <IntegrationsIcon color="#747474" />
    },
    route: "/integrations"
  },
  {
    key: "customization",
    icon: {
      active: <CustomizationIcon className="text-primary"/>,
      inactive: <CustomizationIcon color="#747474" />
    },
    route: "/customization"
  }
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