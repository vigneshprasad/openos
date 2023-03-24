import type { CommandResultType, JsonData, TableRow } from "~/types/types";

interface Props {
    props: CommandResultType;
}

const RazorpayData: React.FC<Props> = ({ props }) => {
    const [dataRaw, error ] = props
    const data = dataRaw as JsonData;
    return (
        <>
            { data && 
                <>
                    <div className="text-white">
                        <h3>
                            {
                                data.dateRange && 
                                `The date range was interpreted as 
                                    ${data.dateRange.from && data.dateRange.from.toLocaleDateString()} 
                                    to ${data.dateRange.from && data.dateRange.to.toLocaleDateString()}`
                            }
                        </h3>
                        <h3>
                            {
                                data.customer && 
                                `The customer was interpreted as
                                    Name: ${String(data.customer.name)}
                                    Email: ${String(data.customer.email)}
                                    Phone: ${String(data.customer.phone)}
                                `
                            }
                        </h3>
                        <h3>
                            {
                                data.entityName && 
                                `The entity to provide was interpreted as ${String(data.entityName)}`
                            }
                        </h3>
                        <h3>
                            {
                                data.orderId && 
                                `The orderID was interpreted as ${String(data.orderId)}`
                            }
                        </h3>
                    </div>
                    <div className="flex flex-col text-white w-full text-center">
                    { data?.result && data.result.length === 0 && <h1>No results</h1>}
                    {
                        data?.result && data.result.length > 0 &&
                        <div className="w-full max-w-screen overflow-x-auto">
                            <table className="w-full max-w-screen overflow-x-auto">
                                <thead>
                                    {
                                        data?.result &&  
                                        Object.keys(data?.result[0] as TableRow).map(
                                            (key: string) => {
                                                return (
                                                    <th key={key}>{key}</th>
                                                )
                                            }
                                        )
                                    }
                                </thead>
                                <tbody>
                                {data?.result && data.result.map((row: TableRow, index:number) => (
                                    <tr key={index}>
                                        {Object.keys(row).map((key: string) => {
                                            return (      
                                                <td key={key}>{row[key]?.toString()}</td>
                                            )}
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    }
                    </div>
                </>
            }
            {error && 
                <div className="justify-content-end mt-8">
                    {error && <p className="text-red-500">Error: {error?.message} </p>}
                    <br />
                    {error && <p className="text-red-500">Details: {String(error?.cause)} </p>}
                    <br />
                    {error && <p className="text-red-500">Query: {String(error?.query)} </p>}
                </div>
            }
        </>
    );
};

export default RazorpayData;
