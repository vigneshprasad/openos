import type { QueryAndResult, CommandResultType, TableRow } from "~/types/types";

interface Props {
    props: CommandResultType;
}

const QueryResult: React.FC<Props> = ({ props }) => {
    const [dataRaw, error ] = props
    const data = dataRaw as QueryAndResult;

    return (
        <>
            { data && 
                <div>
                    {data?.query && 
                        <div>
                            <h3 className="text-[#616161] text-sm">Your question was converted to SQL as</h3>
                            <h3 className="pt-1 text-white text-sm">{data.query}</h3>
                            <br />
                        </div>
                    }
                    <div>
                        { data?.result && data.result.length === 0 && <h1>No results</h1>}
                        {
                            data?.result && data.result.length > 0 &&
                            <div className="tableDiv">
                                <p className="table-heading">
                                    {data.name}
                                </p>
                                <table>
                                    <thead>
                                        {
                                            data?.result && 
                                            data.result.length > 1 && 
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
                                                    <td key={key}>
                                                        <div>
                                                            {row[key]?.toString()}
                                                        </div>
                                                    </td>
                                                )}
                                            )}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
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

export default QueryResult;
