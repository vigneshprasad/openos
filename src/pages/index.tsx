import { type NextPage } from "next";
import Head from "next/head";
import { GettingStartedModal } from "~/components/GettingStartedModal";
import { CommandHistorySection } from "~/components/CommandHistorySection";
import { BaseLayout } from "~/components/BaseLayout";
import { IntegrationStatus } from "~/components/IntegrationStatus";
import { MainTerminal } from "~/components/MainTerminal";

const Home: NextPage = () => {

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Toolsyo to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GettingStartedModal />
            <BaseLayout activeKey="terminal">
                <div className="grid grid-cols-[3fr_1fr] grid-rows-1">
                    <div className="grid grid-rows-[max-content_1fr] grid-cols-1">
                        <div className="h-12 flex-row flex flex-basis-content p-1 bg-homepage-tab-background">
                            <IntegrationStatus />
                        </div>
                        <MainTerminal />
                    </div>
                    <CommandHistorySection />
                </div>
            </BaseLayout>
        </>
    );
};

export default Home;
