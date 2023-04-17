import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export const Navbar: React.FC = () => {
    const { data: sessionData } = useSession();

    const src = sessionData?.user?.image ?? ""

    return (
        <div className="navbar pl-2.5 py-2 pr-[18px] flex justify-between items-center bg-[#1C1B1D]">
            <Image src="/halo_logo.png" alt="Logo" width={24} height={24} />
            
            <text className="font-bold text-[#fff]">
                {sessionData?.user?.name ? `${sessionData.user.name}'s Dashboard` : ""} 
            </text> 
            <div className="dropdown text-[#fff]">
                {sessionData?.user ? (
                    <label 
                        tabIndex={0}
                        className="btn-ghost btn-circle avatar btn"
                        onClick={() => void signOut({ callbackUrl: '/auth/signin'})}
                    >
                        {sessionData?.user?.image && <div className="w-7">
                            <Image className="rounded-full"
                                loader={() => src}
                                src={src}
                                alt={sessionData?.user?.name ?? ""}
                                width={28}
                                height={28}
                            />
                        </div>}
                    </label>
                ) :  (
                    <button 
                        className="btn-ghost rounded-btn btn"
                        onClick={() => void signIn()}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );
}
