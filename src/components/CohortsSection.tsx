import { useEffect, useState } from "react";
import { type Cohort } from "~/server/api/routers/dataModelRouter";
import { api } from "~/utils/api";

const CohortsSection = ({
    modelId
}: {
    modelId?: string
}) => {

    const [features, setFeatures] = useState<Cohort[]>([]);

    const runGetCohorts = api.dataModelRouter.getCohorts.useMutation({
        onSuccess: (cohorts) => {
            setFeatures(cohorts);
        }
    })
    useEffect(() => {
    if (!modelId) return;
        runGetCohorts.mutate({
            modelId,
        })
    }, [modelId]);


    return <div className="bg-white">
        <table className="w-full">
            <thead className="w-full border-none sticky">
                <th className="py-3">Event</th>
                <th>Predicted Churn (Numerical)</th>
                <th>Actual value (Numerical)</th>   
                <th>Deviation (%)</th>
                {/* <th>Download List</th> */}
            </thead>
            <tbody className="w-full">
                {features.map((row) => {
                    return <tr key={row.name} className="w-full">
                        <td className="">{row.name}</td>
                        <td className="text-center">{Math.round(row.predictedChurn * 100)}</td>
                        <td className="text-center">{Math.round(row.actualChurn  * 100)}</td>
                        <td className="text-center">{Math.round(row.deviation  * 100)}%</td>
                        {/* <td className="cursor-pointer text-center underline">Download</td> */}
                    </tr>
                })}
            </tbody>
        </table>
    </div>
}

export default CohortsSection;