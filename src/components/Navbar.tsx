import { signIn, signOut, useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
    const { data: sessionData } = useSession();

    return (
        <div className="navbar flex p-2">
            <div className="flex-1 m-auto font-bold text-white">
                {sessionData?.user?.name ? `${sessionData.user.name}'s Dashboard` : ""} 
            </div> 
            <div className="flex-2 dropdown text-white">
                {sessionData?.user ? (
                    <label 
                        tabIndex={0} 
                        className="btn-ghost btn-circle avatar btn"
                        onClick={() => void signOut({ callbackUrl: '/auth/signin'})}
                    >
                        <div className="w-10">
                            <img className="rounded-full"
                                src={sessionData?.user?.image ?? ""}
                                alt={sessionData?.user?.name ?? ""}
                            />
                        </div>
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
