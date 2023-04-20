import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

import { api } from "~/utils/api";
import "~/styles/globals.css";

// const jetbrains = localFont({ 
//     src: '../../public/fonts/JetBrainsMono[wght].ttf',
//     variable: '--font-jetbrains'
// })

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
        <main className={`${inter.className}`}>
            <Component {...pageProps} />
        </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
