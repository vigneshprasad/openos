import { type NextPage } from "next";
import Head from "next/head";
import { GettingStartedModal } from "~/components/GettingStartedModal";
import { MainTerminal } from "~/components/MainTerminal";
import { CommandHistorySection } from "~/components/CommandHistorySection";
import { BaseLayout } from "~/components/BaseLayout";
import { useState } from "react";
import { PredictiveAnalysisTerminal } from "~/components/PredictiveAnalysis";
import { MarketingAnalysisTerminal } from "~/components/MarketingAnalysis";

const Home: NextPage = () => {

    const [tab, setTab] = useState("tab1");
    

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
                        <div className="h-12 flex-row flex flex-basis-content p-1 bg-[#131313] border border-solid border-[#333] border-l-0">
                            <div className={`${tab==="tab1" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} onClick={() => setTab("tab1")}>
                                <text className="text-sm font-normal text-[#fff]">Data Analysis</text>
                            </div>
                            <div className={`${tab==="tab2" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} onClick={() => setTab("tab2")}>
                                <text className="text-sm font-normal text-[#fff]">Predictive Analysis</text>
                            </div>
                            <div className={`${tab==="tab3" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} onClick={() => setTab("tab3")}>
                                <text className="text-sm font-normal text-[#fff]">Marketing Analysis</text>
                            </div>
                        </div>
                        { tab === "tab1" && <MainTerminal /> }
                        { tab === "tab2" && <PredictiveAnalysisTerminal /> }
                        { tab === "tab3" && <MarketingAnalysisTerminal /> }
                    </div>
                    <CommandHistorySection />
                </div>
            </BaseLayout>  
        </>
    );
};

export default Home;
