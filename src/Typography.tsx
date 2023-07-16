import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface IProps {
    children: React.ReactNode;
    variant: 'h2' | 'sub';
    className?: string;
}

const Typography: React.FC<IProps> = ({
    variant,
    children,
    className
}) => {

    const variantSpecificClasses = useMemo(() => {
        switch (variant) {
            case 'h2': 
                return `text-black font-bold text-xl`
            case 'sub':
                return 'text-sm text-subtext';
            default:
                return '';
        }
    }, [variant]);

    return <span className={twMerge(variantSpecificClasses, className)}>{children}</span>
}

export default Typography;