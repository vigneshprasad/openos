import { CONVERSION_MODEL } from "~/constants/modelTypes";
import { type AggregateChurn } from "~/server/api/routers/dataModelRouter";

const CohortTable = ({
    data,
    isConversion,
}: {
    data: AggregateChurn[];
    isConversion?: boolean
}) => {

    return (
        <div className="overflow-x-auto w-full">
            <div className="grid grid-cols-[1fr_0.5fr_0.5fr] text-xs bg-table-heading-background-colour text-light-grey-text-colour p-4 uppercase font-medium">
                <div>Cohort</div>
                <div>Total</div>
                <div>{isConversion ? CONVERSION_MODEL : 'Churn'} Rate</div>
            </div>
            <div className="text-xs text-light-text-colour font-light">
                {
                    data.map((item, index) => (
                        <div key={index} className={`grid grid-cols-[1fr_0.5fr_0.5fr] mx-4 py-4 ${index !== data.length - 1  ? "border-b border-border-colour" : ""}`}>
                            <div>{item.title}</div>
                            <div>{item.totalUsers}</div>
                            <div>{item.predictedChurnUsers.toFixed(2)}%</div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default CohortTable;
