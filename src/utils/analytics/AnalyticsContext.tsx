import { type Analytics, AnalyticsBrowser, type Options } from "@segment/analytics-next";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/router";
import { SEGMENT_KEY } from "~/constants/global.constants";
import { useSession } from "next-auth/react";

export interface IAnalyticsState {
    track: (
        event: string,
        properties?: Record<string, unknown>,
        options?: Options,
        callback?: () => void
    ) => void;
    identify: (
        id?: string,
        traits?: Record<string, unknown>,
        options?: Options,
        callback?: () => void
    ) => void;
    page: (
        ...args: Parameters<Analytics["page"]>
    ) => ReturnType<Analytics["page"]> | undefined;
}

export const AnalyticsContext = createContext({} as IAnalyticsState);

type IProviderProps = PropsWithChildren<unknown>;

export function AnalyticsProvider({ ...rest }: IProviderProps): JSX.Element {
    const [segment, setSegment] = useState<Analytics | undefined>();
    const { data: session, status } = useSession();
    const router = useRouter();

    const page = useCallback(
        (
            ...args: Parameters<Analytics["page"]>
        ): ReturnType<Analytics["page"]> | undefined => {
            if (segment) {
                return segment?.page(...args);
            }
        },
            [segment]
    );

    const track = useCallback(
        (
            event: string,
            properties?: Record<string, unknown>,
            options?: Options,
            callback?: () => void
        ) => {
            if (segment) {
                void segment.track(event, properties, options, callback);
            }
        },
        [segment]
    );

    const identify = useCallback(
        (
            id?: string,
            traits?: Record<string, unknown>,
            options?: Options,
            callback?: () => void
        ) => {
            if (segment) {
                void segment.identify(id, traits, options, callback);
            }
        },
        [segment]
    );

    useEffect(() => {
        if (segment) {
            if (status === "authenticated" && session?.user) {
                identify(session?.user.id, {
                    name: session?.user.name,
                    email: session?.user.email,
                    image: session?.user.image
                });
            }
        }
    }, [segment, session, identify, status]);

    useEffect(() => {
        async function intialize(writeKey: string): Promise<void> {
            if (writeKey) {
                const [res] = await AnalyticsBrowser.load({ writeKey });
                setSegment(res);
                void res.page();
            }
        }
        void intialize(SEGMENT_KEY);
    }, []);

    // Router events
    useEffect(() => {
        const handlePageChnaged = (): void => {
            void page();
        };

        router.events.on("routeChangeComplete", handlePageChnaged);
        return () => {
            router.events.off("routeChangeComplete", handlePageChnaged);
        };
    }, [router, page]);

    const value = useMemo(
        () => ({
            track,
            identify,
            page,
        }),
        [track, identify, page]
    );

    return <AnalyticsContext.Provider value={value} {...rest} />;
}

export default function useAnalytics(): IAnalyticsState {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("You need to wrap AnalyticsProvider.");
  }

  return context;
}