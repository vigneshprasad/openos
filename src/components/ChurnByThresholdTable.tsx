import { CSVLink } from "react-csv";
import { type ChurnByThreshold } from "~/server/api/routers/dataModelRouter";
import { convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";

const ChurnByThresholdTable = ({
    buckets,
}: {
    buckets: ChurnByThreshold[],
}) => {

    let maxBucket = 0;
    buckets.forEach(bucket => {
        if (bucket.numberOfUsers > maxBucket) {
            maxBucket = bucket.numberOfUsers;
        }
    });

    return <div className="bg-white flex flex-col gap-4 rounded-lg">
        <div className="py-4">
            {buckets.map((row, index) => {
                return (
                    <div key={index} className="grid grid-cols-[0.1fr_1fr_2fr_0.2fr_0.5fr] p-4 mr-4 ml-4 gap-6">
                        <div className="w-6 h-6 bg-light-grey-background-colour text-sm flex justify-center"> 
                            <div className="my-auto">{index + 1}</div>
                        </div>
                        <div className="text-sm">{row.name}</div>
                        <div className="w-full rounded-md bg-light-grey-background-colour">
                            <div 
                                className="bg-accent-colour h-full rounded-md w-1/2"
                                style={
                                    {
                                        'width': `${(row.numberOfUsers / maxBucket * 100).toFixed(0)}%`
                                    }
                                }
                            ></div>
                        </div>
                        <div> {row.numberOfUsers} </div>
                        <CSVLink className="w-fit-content mx-auto" data={convertSimpleReportToExcel(row.userList.sheet)} target="_blank">
                            <p className="text-xs text-accent-colour">Download Users</p>
                        </CSVLink>
                    </div>
                );
            })}
        </div>
    </div>
}

export default ChurnByThresholdTable;