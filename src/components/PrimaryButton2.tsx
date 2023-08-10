import React from 'react';
import { twMerge } from 'tailwind-merge';

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    paddingY?: number;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const PrimaryButton2: React.FC<IProps> = ({ children, className, paddingY, onClick }) => {
    return <button className={twMerge(
        `bg-accent-colour text-white rounded-lg ${paddingY ? `py-${paddingY}`: 'py-2'} px-3 font-normal text-xs flex hover-accent-colour-dark cursor-pointer`,
        className)}
        onClick={onClick}
    >
        {children}
    </button>
}