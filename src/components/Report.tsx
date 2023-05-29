import { type SavedQuery } from "@prisma/client";
import type { CommandResultType, ExcelSheet } from "~/types/types";
import { QueryFeedback } from "./QueryFeedback";
import { removeEmptyColumns } from "~/utils/removeEmptyColumns";
import { ErrorBox } from "./ErrorBox";
import Image from "next/image";
import { QueryTooltip } from "./QueryTooltip";

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
                <div className="tableDiv hide-scrollbar max-w-max">
                    <div className="table-heading flex gap-1">
                        <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                        <p>{dataRaw.heading}</p>
                    </div>
                    <table>
                        <thead className="report-table">
                            <tr>
                                {dataRaw.sheet[0] && dataRaw.sheet[0].map(
                                    (cell, index) => (
                                        <th
                                            key={index}
                                        >
                                            <div>{cell.value}</div>
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody className="report-table">
                            {grid.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td key={j}>
                                            <div className={`
                                                    ${cell.query ? "" : "textAlignLeft"}
                                                    flex gap-4 items-center
                                                    ${cell.query ? "justify-between" : "justify-center"}
                                                `}
                                            >
                                                {
                                                    cell.value == '0' ||
                                                    cell.value == 0 ||
                                                    cell.value == "0.00" ||
                                                    cell.value == "NaN" ||
                                                    cell.value == "-Infinity" || 
                                                    cell.value == Infinity ||
                                                    cell.value == -Infinity ? "-" : cell.unitPrefix ?
                                                        <p>{cell.unit && cell.unit}{cell.value}</p> : 
                                                        <p>{cell.value}{cell.unit && cell.unit}</p>
                                                }

                                                {cell.query && (
                                                    <div className="justify-self-end flex gap-1 items-center justify-between">
                                                        <QueryFeedback queryProp={cell.query} />
                                                        <QueryTooltip query={cell.query.query} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    ))}
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
