import { type SavedQuery } from "@prisma/client";
import type { CommandResultType, ExcelSheet } from "~/types/types";
import { QueryFeedback } from "./QueryFeedback";
import { removeEmptyColumns } from "~/utils/removeEmptyColumns";
import { ErrorBox } from "./ErrorBox";
import Image from "next/image";

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
    if(dataRaw && dataRaw.sheet) {
        dataRaw.sheet = removeEmptyColumns(dataRaw.sheet);
    }
    const tableData = dataRaw && dataRaw.sheet.slice(1) as GridElement[][];
    const grid = tableData ? tableData : [];

    return (
        <div>
            {data && 
                <div className="tableDiv max-w-max">
                    <div className="table-heading flex gap-1">
                        <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                        <p>{dataRaw.heading}</p>
                    </div>
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
                <ErrorBox
                    title={error.message}
                    description={error.cause}
                />
            }
        </div>
    );
};

export default Report;
