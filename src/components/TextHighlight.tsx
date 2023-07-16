import { type PropsWithChildren } from "react";

const HighlightedText = ({
    children
}: PropsWithChildren) => {
    return <span className="text-[#001AFF] p-1 bg-highlight/40 font-semibold">{children}</span>
}
export default HighlightedText;