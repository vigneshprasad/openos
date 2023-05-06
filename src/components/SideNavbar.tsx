import Link from "next/link";
import IntegrationsIcon from "./icons/Integrations"
import TerminalIcon from "./icons/Terminal"

export type SideNavKeys = "terminal" | "integrations"

type IProps = {
  activeKey: SideNavKeys;
}

const SIDENAV_ITEMS = [
  {
    key: "terminal",
    icon: {
      active: <TerminalIcon color="#4191F6" />,
      inactive: <TerminalIcon color="#747474" />
    },
    route: "/"
  },
  {
    key: "integrations",
    icon: {
      active: <IntegrationsIcon color="#4191F6" />,
      inactive: <IntegrationsIcon color="#747474" />
    },
    route: "/integrations"
  },
] 

export const SideNavbar: React.FC<IProps> = ({activeKey}) => {
  return (
    <div className="w-11 p-1 bg-[#1C1B1D] border border-solid border-[#333]
      border-l-0 border-b-0 flex-col gap-3 items-center">
        {SIDENAV_ITEMS.map(({key, icon, route}) => {
            const active = activeKey === key

            return (
                <Link href={route} key={key}>
                    <div className="p-2 flex flex-col gap-1 items-center">
                        {active ? icon.active : icon.inactive}
                        {active && <div className="w-1 h-1 bg-[#4191F6]" />}
                    </div>
                </Link>
            )
        })}
    </div>
  )
}