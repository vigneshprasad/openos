import { type ActionableInsights, type Insights } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { api } from "~/utils/api";
import { convertStringToColour } from "~/utils/convertStringToColour";
import { InsightFeedback } from "./InsightFeedback";

interface IProps {
    insight?: Insights;
}

export const InsightSection: React.FC<IProps> = ({ insight }) => {

    let actionableInsights: ActionableInsights[] = [];
    if(insight) {
        const actions = api.insightsRouter.getActionableByInsight.useQuery({
            insightId: insight.id
        });
        if(actions.data) {
            actionableInsights = actions.data;
        }
    }

    return (
        <div className="bg-white grid grid-rows-[max-content_1fr] grid-cols-1">
            <div className="h-12 p-3 border-b border-solid border-b-slate-200">
                <text className="text-sm text-[#838383] font-medium">Insights</text>
            </div>
            <div className="overflow-auto">
                {
                    insight ? (
                        <div className="flex flex-col gap-2">
                            <div className="pt-5 mx-5 pb-5 flex flex-col pr-5 gap-4 border-b border-solid border-[#616161]">
                                <h3 className="font-semibold">
                                    {insight.title}
                                </h3>
                                <p className="text-sm text-[#616161]"> {insight.description} </p>
                            </div>
                            <div className="pt-5 mx-5 pb-5 flex flex-col pr-5 gap-4 border-b border-solid border-[#616161]">
                                <h3>
                                    Properties
                                </h3>
                                <div className="flex flex-row gap-4 h-8 text-sm">
                                    <div className="text-[#616161] my-auto min-w-[100px]"> Date Posted </div>
                                    <div className="my-auto"> {insight.datePosted.toLocaleDateString()}</div>
                                </div>
                                <div className="flex flex-row gap-4 h-8 text-sm">
                                    <div className="text-[#616161] my-auto min-w-[100px]"> Feedback </div>
                                    <InsightFeedback insight={insight} />
                                </div>
                                <div className="flex flex-row gap-4 h-8 text-sm">
                                    <div className="text-[#616161] my-auto min-w-[100px]"> Tag </div>
                                    <div className={`rounded-full bg-[${convertStringToColour(insight.tag)}] px-2 py-1 my-1 text-xs`}>
                                        {insight.tag}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-5 mx-5 pb-5 flex flex-col pr-5 gap-4">
                                <h3>
                                    Actionable Insights
                                </h3>
                                {actionableInsights?.map((action) => (
                                    <p key={action.id} className="text-sm">
                                        - {action.descrtiption}
                                    </p>
                                ))}
                            </div>

                            
                        </div>
                    ) : (
                        <div className="w-[80%] mx-auto mt-[70px]">
                            <Image
                                src="/command_history_empty.png"
                                alt="Select a Insight"
                                width={36}
                                height={36}
                                className="mx-auto" />
                            <div className="pt-3">
                                <h3 className="text-sm font-medium text-center">
                                    Select an Insight for more details
                                </h3>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}