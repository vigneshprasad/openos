import { type SavedQuery } from "@prisma/client";
import type { CommandResultType, ExcelSheet } from "~/types/types";
import { QueryFeedback } from "./QueryFeedback";
import { removeEmptyColumns } from "~/utils/removeEmptyColumns";

interface Props {
    props: CommandResultType
}

interface GridElement {
    value: number | string;
    expression?: string;
    hint?: string;
    query?: SavedQuery;
    unit?: string;
    unitPrefix?: boolean
}

const Report: React.FC<Props> = ({ props }) => {
    const [data, error] = props
    const dataRaw = data as ExcelSheet;
    dataRaw.sheet = removeEmptyColumns(dataRaw.sheet);
    const tableData = dataRaw && dataRaw.sheet.slice(1) as GridElement[][];
    const grid = tableData ? tableData : [];

    return (
        <>
            {data && 
                <div className="tableDiv">
                    <p className="table-heading">{dataRaw.heading}</p>
                    <table>
                        <thead>
                            <tr>
                                {dataRaw.sheet[0] && dataRaw.sheet[0].map(
                                    (cell, index) => (
                                        <th 
                                            // colSpan={index === 0 ? 2 : undefined}
                                            key={index}
                                        >
                                            <div>{cell.value}</div>
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {grid.map((row, i) => (
                                <tr key={i}>
                                    {/* <td>{i+1}</td> */}
                                    {row.map((cell, j) => {
                                        if(cell.query) {
                                            return (
                                                <div key={j}>
                                                    <td>
                                                        <div>
                                                            <QueryFeedback queryProp={cell.query}/>
                                                        </div>
                                                    </td>
                                                    <td className="CellWithComment">
                                                        <div>
                                                            {
                                                                cell.unitPrefix ?
                                                                <span>{cell.unit && cell.unit}{cell.value}</span>
                                                                : <span>{cell.value}{cell.unit && cell.unit}</span>
                                                            }
                                                            <span className="CellComment">{cell.query.query}</span>
                                                        </div>
                                                    </td>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <td key={j}>
                                                    <div>
                                                        {
                                                            cell.value == '0' ||
                                                            cell.value == 0 ||
                                                            cell.value == "0.00" ||
                                                            cell.value == "NaN" ||
                                                            cell.value == "-Infinity" || 
                                                            cell.value == Infinity ||
                                                            cell.value == -Infinity ?
                                                            "-" 
                                                            : cell.unitPrefix ?
                                                                <span>{cell.unit && cell.unit}{cell.value}</span>
                                                                : <span>{cell.value}{cell.unit && cell.unit}</span> 
                                                        }
                                                    </div>
                                                </td>
                                            )
                                        }
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

export default Report;
