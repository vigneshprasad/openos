import { type AggregateChurn } from "~/server/api/routers/dataModelRouter";

const CohortTable = ({
    data,
}: {
    data: AggregateChurn[];
}) => {

    return (
        <div className="overflow-x-auto w-full">
            <div className="grid grid-cols-3 text-xs bg-table-heading-background-colour text-light-grey-text-colour p-4 uppercase font-medium">
                <div>Cohort</div>
                <div>Total</div>
                <div>Churn Rate</div>
            </div>
            <div className="text-xs text-light-text-colour font-light">
                {
                    data.map((item, index) => (
                        <div key={index} className={`grid grid-cols-3 mx-4 py-4 ${index !== data.length - 1  ? "border-b border-border-colour" : ""}`}>
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
