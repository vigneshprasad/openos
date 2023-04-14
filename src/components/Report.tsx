import { type SavedQuery } from "@prisma/client";
import type { CommandResultType, ExcelCell } from "~/types/types";
import { QueryFeedback } from "./QueryFeedback";

interface Props {
    props: CommandResultType
}

interface GridElement {
    value: number | string;
    expression?: string;
    hint?: string;
    query?: SavedQuery;
}

const Report: React.FC<Props> = ({ props }) => {
    const [data, error] = props
    const dataRaw = data as ExcelCell[][]
    const tableData = data && dataRaw.slice(1) as GridElement[][];
    const grid = tableData ? tableData : [];
    return (
        <>
            { data && 
                <>
                    <div className="flex flex-col text-white w-full text-center max-w-full overflow-x-scroll">
                        {
                            <table>
                                <thead>
                                    <tr>
                                        {dataRaw[0] && dataRaw[0].map(
                                            (cell, index) => (
                                                <th key={index}>{cell.value}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {grid.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => {
                                                if(cell.query) {
                                                    return (
                                                        <div key={j}>
                                                            <td><QueryFeedback queryProp={cell.query}/></td>
                                                            <td className="CellWithComment">
                                                                {cell.value}
                                                                <span className="CellComment">{cell.query.query}</span>
                                                            </td>
                                                        </div>
                                                    )
                                                } else {
                                                   return <td key={j}>{
                                                        cell.value == '0' ||
                                                        cell.value == 0 ||
                                                        cell.value == "0.00" ||
                                                        cell.value == "NaN" ||
                                                        cell.value == "-Infinity" || 
                                                        cell.value == Infinity ||
                                                        cell.value == -Infinity ?

                                                        "-" : cell.value
                                                   }</td> 
                                                }
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default Report;
