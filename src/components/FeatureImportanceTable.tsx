import type { FeatureImportance } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChurnScatterChartModal } from "~/components/ChurnScatterChartModal";
import { api } from "~/utils/api";


const FeaturesImportanceTable = ({
    features,
}: {
    features: FeatureImportance[],
}) => {

    return <div className="bg-white flex flex-col gap-4 rounded-lg">
        <div className="py-4">
            {features.map((row, index) => {
                return (
                    <div key={row.id} className="grid grid-cols-[0.1fr_1.25fr_2fr_0.25fr] p-4 mr-8 ml-4 gap-12">
                        <div className="w-6 h-6 bg-light-grey-background-colour text-sm flex justify-center"> 
                            <div className="my-auto">{index + 1}</div>
                        </div>
                        <div className="border-y-0 border-l-0">{row.featureName}</div>
                        <div className="w-full rounded-md bg-light-grey-background-colour">
                            <div 
                                className="bg-accent-colour h-full rounded-md w-1/2"
                                style={
                                    {
                                        'width': `${features[0]?.importance ? ((row.importance / features[0]?.importance) * 100).toFixed(0) : '0'}%`
                                    }
                                }
                            ></div>
                        </div>
                        <div> {row.importance.toFixed(4)} </div>
                    </div>
                );
            })}
        </div>
    </div>
}

export default FeaturesImportanceTable;