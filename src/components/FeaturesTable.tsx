import type { FeatureImportance } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChurnScatterChartModal } from "~/components/ChurnScatterChartModal";
import { api } from "~/utils/api";


const FeaturesTable = ({
    modelId,
    date
}: {
    modelId?: string,
    date?: Date
}) => {

    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
    const [features, setFeatures] = useState<FeatureImportance[]>([]);

    const runGetFeatures = api.dataModelRouter.getFeatures.useMutation({
        onSuccess: (data) => {
            setFeatures(data);
        }
    })
    
    const handleOpenChange = () => {
        setSelectedFeatureId(null);
    }

    useEffect(() => {
        if (!modelId) return;
        runGetFeatures.mutate({
            modelId,
        })
    }, [modelId]);
    
    const feature = features.find((feature) => feature.id === selectedFeatureId);

    return <div className="bg-white flex flex-col gap-4 h-[400px] rounded-lg grow">
        <div className="flex gap-2 pl-4 pt-4">
            <p>Factors Contributing to User Churn</p>
            <Image src="/svg/arrow-right-up.svg" alt="arrow" width={24} height={24} />
        </div>
        <table className="overflow-y-auto p-3">
        <tbody className="w-full">
                {features.map((row, index) => {
                    return <tr key={row.id} className={twMerge(
                        "w-full h-13 border border-x-0 border-border",
                        index && "border-t-0"
                        )}>
                        <td className="border-y-0 border-l-0 w-1/3">{row.featureName}</td>
                        <td className="border-y-0 ">
                            <span className={twMerge(
                                row.type === "feature" ? "bg-[#D4F8D3]" : "bg-[#EDE7FB]",
                                'p-2 rounded'
                            )}>{row.type}</span>
                        </td>
                        <td className="border-0 cursor-pointer flex justify-center items-center pt-4" onClick={() => setSelectedFeatureId(row.id)}>
                            <Image src="/svg/drag.svg" alt="arrow" width={15} height={15} />
                        </td>
                    </tr>
                })}
                </tbody>
        </table>
        {selectedFeatureId && feature && <ChurnScatterChartModal
            isOpen={!!selectedFeatureId}
            modelId={modelId}
            featureId={selectedFeatureId}
            handleOpenChange={handleOpenChange}
            date={date}
            featureName={feature.featureName}
        />}
    </div>
}

export default FeaturesTable;