import { type PropsWithChildren } from "react"
import { Navbar } from "./Navbar"
import { type SideNavKeys, SideNavbar } from "./SideNavbar"

type IProps = PropsWithChildren & {
  activeKey: SideNavKeys;
}

export const BaseLayout: React.FC<IProps> = ({activeKey, children}) => {
  return (
    <main className="min-h-screen h-full overflow-auto bg-slate-50 ">
      <Navbar />
      <div className="h-[calc(100vh_-_44px)] grid grid-cols-[max-content_1fr] grid-rows-1">
        <SideNavbar activeKey={activeKey} />
        <div className="grid grid-rows-1">
          {children}
        </div>
      </div>
    </main>
  )
}