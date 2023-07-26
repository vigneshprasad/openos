import { type Insights } from "@prisma/client";
import { type NextPage } from "next";
import { useState } from "react";
import Typography from "~/Typography";
import { BaseLayout } from "~/components/BaseLayout";
import { InsightSection } from "~/components/InsightSection";
import { IntegrationStatus } from "~/components/IntegrationStatus";
import { api } from "~/utils/api";
import { convertStringToColour } from "~/utils/convertStringToColour";

const InsightsPage: NextPage = () => {

    const insights = api.insightsRouter.getAll.useQuery();
    const [selectedInsight, setSelectedInsight] = useState<Insights>();

    return (
        <BaseLayout activeKey="insights">
            <div className="grid grid-cols-[2fr_1fr] grid-rows-1">
                <div className="grid grid-rows-[max-content_1fr] grid-cols-1">
                    <div className="h-12 flex-row flex flex-basis-content p-1 bg-homepage-tab-background">
                        <IntegrationStatus />
                    </div>
                    <div className="flex justify-between h-full">
                        <div className="flex w-full flex-col p-1 m-4 gap-8 items-center text-center">
                            <div className="flex flex-col mt-[1%]">
                                <Typography variant="h2">Insights</Typography>
                            </div>
                            <div className="flex justify-center mb-5 w-full">
                                <div className="flex flex-col justify-between w-full">
                                    <div className="bg-section-header flex flex-col gap-2 py-5 px-3 rounded-t-lg">
                                        {insights.data?.map((insight) => (
                                            <div
                                                className="cursor-pointer" 
                                                key={insight.id} onClick={() => setSelectedInsight(insight)}>
                                                <div 
                                                    className="py-3 pl-3 pr-4 grid
                                                    gap-4 items-start bg-[#FFF] rounded-md"
                                                >
                                                    <div className="flex flex-row justify-between align-middle">
                                                        <h3 className="text-sm font-semibold my-auto">
                                                            {insight.title}
                                                        </h3>
                                                        <div className={`rounded-full bg-[${convertStringToColour(insight.tag)}] px-2 py-1 my-2 text-xs`}>
                                                            {insight.tag}
                                                        </div> 
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <InsightSection insight={selectedInsight}/>
            </div>
            
        </BaseLayout>
    )
}

export default InsightsPage;
