import type { QueryAndResult, CommandResultType, TableRow } from "~/types/types";
import { ErrorBox } from "./ErrorBox";
import Image from "next/image";

interface Props {
    props: CommandResultType;
}

const QueryResult: React.FC<Props> = ({ props }) => {
    const [dataRaw, error ] = props
    const data = dataRaw as QueryAndResult;

    return (
        <>
            { data && data !== null && 
                <div>
                    {data?.query && 
                        <div className="pt-2">
                            <h3 className="text-[#616161] text-sm">Your question was converted to SQL as</h3>
                            <h3 className="pt-1 text-white text-sm">{data.query}</h3>
                        </div>
                    }
                    <div>
                        { data?.result && data.result.length === 0 && <h1>No results</h1>}
                        {
                            data?.result && data.result.length > 0 &&
                            <div className="tableDiv">
                                <div className="table-heading flex gap-1 border-b border-solid border-b-[#333]">
                                    <Image src="/svg/query_icon.svg" alt="Report icon" width={12} height={12} />
                                    <p>Output for query</p>
                                </div>
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
                                        {data?.result && data.result.length > 1 ? 
                                            data.result.map((row: TableRow, index:number) => (
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
                                            )
                                        ) : (
                                            <tr className="px-3 pt-4 py-5 flex gap-2">
                                                <p className="text-sm text-[#838383] first-letter:uppercase">
                                                    {data.name}:
                                                </p>
                                                <p className="text-sm text-[#fff]">
                                                    {data.result[0]?.count}
                                                </p>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            }
            {error && 
                <ErrorBox
                    title={error.message}
                    description={error.cause}
                />
            }
        </>
    );
};

export default QueryResult;
