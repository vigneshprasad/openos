import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

import { api } from "~/utils/api";
import "~/styles/globals.css";
import Script from "next/script";
import { AnalyticsProvider } from "~/utils/analytics";

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
        <AnalyticsProvider>
            <Script 
                id="msclarity"
                type="text/javascript" 
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(c,l,a,r,i,t,y){
                            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                        })(window, document, "clarity", "script", "guj4op6jay");
                    `,
                }}
            />
            <main className={`${inter.className}`}>
                <Component {...pageProps} />
            </main>
        </AnalyticsProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
