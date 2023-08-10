import { type PropsWithChildren } from "react"
import { type SideNavKeys, SideNavbar } from "./SideNavbar"

type IProps = PropsWithChildren & {
    activeKey: SideNavKeys;
}

export const BaseLayout2: React.FC<IProps> = ({ activeKey, children }) => {
    return (
        <main className="min-h-screen h-full overflow-auto bg-slate-50 ">
            <SideNavbar activeKey={activeKey} />
            <div className="h-[calc(100vh)]">
                <div className="grid">
                    {children}
                </div>
            </div>
        </main>
    )
}