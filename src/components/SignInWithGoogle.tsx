import Image from "next/image"
import { signIn } from "next-auth/react";

export const SignInWithGoogle: React.FC = () => {
  return (
    <button className="w-full h-[40px] px-2 flex-row bg-[#0B0B0B] gap-2 items-center justify-center rounded-md 
      hover:cursor-pointer hover:bg-[#373737]" 
      onClick={() => void signIn('google', { callbackUrl: '/' })}
    >
      <Image src="/svg/google_g_icon.svg" alt="Google icon" width={40} height={40} />
      <text className="text-sm text-[#fff]">Sign in with Google</text>
    </button>
  )
}