import React from 'react';

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const PrimaryButton: React.FC<IProps> = ({ children }) => {
    return <button className="bg-primary/10 text-primary rounded-md mt-3 py-2 px-3
        font-normal text-xs flex gap-1.5
        hover:bg-primary/20 cursor-pointer"
    >
        {children}
    </button>
}