import type { CommandResultType, ExcelCell } from "~/types/types";
import React, { useState } from "react";
import ReactDataSheet from 'react-datasheet';


interface Props {
    props: CommandResultType
}

interface GridElement extends ReactDataSheet.Cell<GridElement> {
    value: number | string;
    expression?: string;
    hint?: string;
}

const FinancialReport: React.FC<Props> = ({ props }) => {
    const [data, error ] = props
    const dataRaw = data as ExcelCell[][]
    const tableData = dataRaw.slice(1);
    const [grid, setGrid] = useState<GridElement[][]>(tableData)
    return (
        <>
            { data && 
                <>
                    <div className="flex flex-col text-white w-full text-center max-w-full overflow-x-scroll">
                        <ReactDataSheet
                            data={grid}
                            valueRenderer={cell => cell.value}
                            dataRenderer={cell => cell.expression}
                            sheetRenderer={(props: { children: React.ReactElement }) => (
                                <table>
                                    <thead>
                                        <tr>
                                            {dataRaw[0] && dataRaw[0].map(
                                                (_cell, index) => (
                                                    <th key={index}>{String.fromCharCode(65 + index)}</th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
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
                                        {props.children}
                                    </tbody>
                                </table>
                                )}
                            onCellsChanged={changes => {
                                const gridCopy:GridElement[][] = grid.map(row => [...row])
                                changes.forEach(({ cell, row, col, value }) => {
                                    const rowCopy = gridCopy[row] as GridElement[]
                                    if(value) {
                                        rowCopy[col] = { ...cell, value }
                                    }
                                })
                                setGrid(gridCopy);
                            }}
                        />
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

export default FinancialReport;
