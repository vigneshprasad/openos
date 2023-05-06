import { type PropsWithChildren } from "react"
import { Navbar } from "./Navbar"
import { type SideNavKeys, SideNavbar } from "./SideNavbar"

type IProps = PropsWithChildren & {
  activeKey: SideNavKeys;
}

export const BaseLayout: React.FC<IProps> = ({activeKey, children}) => {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="h-[calc(100vh_-_44px)] grid grid-cols-[max-content_1fr] grid-rows-1">
        <SideNavbar activeKey={activeKey} />
        {children}
      </div>
    </main>
  )
}