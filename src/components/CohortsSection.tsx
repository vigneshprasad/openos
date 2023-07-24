import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { type Cohort } from "~/server/api/routers/dataModelRouter";
import { type ExcelSheet } from "~/types/types";
import { api } from "~/utils/api";
import { convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";
import { PrimaryButton } from "./PrimaryButton";

const CohortsSection = ({
    modelId,
}: {
    modelId?: string
}) => {

    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [userList, setUserList] = useState<ExcelSheet>();

    const runGetCohorts = api.dataModelRouter.getCohorts.useMutation({
        onSuccess: (cohorts) => {
            setCohorts(cohorts);
        }
    })

    const runGetUserList = api.dataModelRouter.getUserList.useMutation({
        onSuccess: (userList) => {
            setUserList(userList);
        }
    })
    
    
    useEffect(() => {
    if (!modelId) return;
        runGetCohorts.mutate({
            modelId,
        })
        runGetUserList.mutate({
            modelId,
        })
    }, [modelId]);


    return <div className="bg-white">
        <table className="w-full">
            <thead className="w-full border-none sticky">
                <th className="py-3">Event</th>
                <th>Number of Users</th>
                <th>Predicted Churn</th>
                <th>Actual Value</th>   
                <th>Deviation (%)</th>
            </thead>
            <tbody className="w-full">
                {cohorts.map((row) => {
                    return <tr key={row.name} className="w-full">
                        <td className="">{row.name}</td>
                        <td className="text-center">{row.totalUsers}</td>
                        <td className="text-center">{Math.round(row.predictedChurn * 100)}%</td>
                        <td className="text-center">{row.actualChurn ? Math.round(row.actualChurn  * 100) : '-'}</td>
                        <td className="text-center">{row.deviation ? Math.round(row.deviation) : '-'}%</td>
                    </tr>
                })}
            </tbody>
        </table>
        <div className="m-5">
            {userList && <CSVLink className="w-fit-content" data={convertSimpleReportToExcel(userList.sheet)} target="_blank">
                <PrimaryButton >
                    <p>Download All Users</p>
                </PrimaryButton>
            </CSVLink>}
        </div>
    </div>
}

export default CohortsSection;