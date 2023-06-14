import { type NextPage } from "next";
import Head from "next/head";
import { GettingStartedModal } from "~/components/GettingStartedModal";
import { MainTerminal } from "~/components/MainTerminal";
import { CommandHistorySection } from "~/components/CommandHistorySection";
import { BaseLayout } from "~/components/BaseLayout";
import { useState } from "react";
import { PredictiveAnalysisTerminal } from "~/components/PredictiveAnalysis";
import { MarketingAnalysisTerminal } from "~/components/MarketingAnalysis";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

const Home: NextPage = () => {

    const [tab, setTab] = useState("Main Tab");
    const { track } = useAnalytics();

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
                            <div className={`${tab==="Main Tab" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} 
                                onClick={() => {
                                    track(AnalyticsEvents.main_tab_clicked);
                                    setTab("Main Tab")
                                }}>
                                <text className="text-sm font-normal text-[#fff]">Data Analysis</text>
                            </div>
                            <div className={`${tab==="Predictive Analysis Tab" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} 
                                onClick={() => {
                                    track(AnalyticsEvents.predictive_analysis_tab_clicked);
                                    setTab("Predictive Analysis Tab")
                                }}>
                                <text className="text-sm font-normal text-[#fff]">Predictive Analysis</text>
                            </div>
                            <div className={`${tab==="Marketing Analysis Tab" ? "bg-[#0A2950]" : "bg-[#041020]"} max-h-full w-[172px] px-2.5 py-2 rounded-md ml-2 cursor-pointer`} 
                                onClick={() => {
                                    track(AnalyticsEvents.marketing_analysis_tab_clicked);
                                    setTab("Marketing Analysis Tab")
                                }}>
                                <text className="text-sm font-normal text-[#fff]">Marketing Analysis</text>
                            </div>
                        </div>
                        { tab === "Main Tab" && <MainTerminal /> }
                        { tab === "Predictive Analysis Tab" && <PredictiveAnalysisTerminal /> }
                        { tab === "Marketing Analysis Tab" && <MarketingAnalysisTerminal /> }
                    </div>
                    <CommandHistorySection />
                </div>
            </BaseLayout>  
        </>
    );
};

export default Home;
