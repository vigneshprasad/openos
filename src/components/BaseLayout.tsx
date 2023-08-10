import { type PropsWithChildren } from "react"
import { type SideNavKeys, SideNavbar } from "./SideNavbar"

type IProps = PropsWithChildren & {
    activeKey: SideNavKeys;
}

export const BaseLayout: React.FC<IProps> = ({ activeKey, children }) => {
    return (
        <main className="min-h-screen h-full overflow-auto bg-slate-50 ">
            <SideNavbar activeKey={activeKey} />
            <div className="h-[calc(100vh)] ml-16">
                <div className="grid grid-rows-1">
                    {children}
                </div>
            </div>
        </main>
    )
}