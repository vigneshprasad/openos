import Image from "next/image"
import { signIn } from "next-auth/react";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

export const SignInWithGoogle: React.FC = () => {
    const { track } = useAnalytics();
    return (
        <button className="w-full h-[40px] px-2 flex-row gap-2 items-center justify-center rounded-md 
        hover:cursor-pointer border-[#888] border-solid border-2" 
            onClick={() => {
                track(AnalyticsEvents.sign_up_button_clicked, {})
                void signIn('google', { callbackUrl: '/' })
            }
        }
        >
            <Image src="/svg/google_g_icon.svg" alt="Google icon" width={40} height={40} />
            <text className="text-sm">Sign in with Google</text>
        </button>
    )
}