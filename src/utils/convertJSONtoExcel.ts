import { type SimpleReportType, type ExcelCell, type TableRow } from "~/types/types";

export const convertSimpleReportToExcel = (data: ExcelCell[][]): string => {
    
    const csv = data.map((item) => {
        const row = item;
        const rowValues = row.map((cell) => cell.value);
        return rowValues.join(",");
    }) .join("\n");

    return csv;
}

export const convertDatabaseQueryResultToExcel = (data: TableRow[]): string => {
    const csv = data.map((item) => {
        const row = item;
        const rowValues = Object.keys(row).map(
            (key: string) => {
                return (row[key] as string);
            }
        );    
        return rowValues.join(",");
    }) .join("\n");

    return csv;
}

export const convertComplexReportToExcel = (data: SimpleReportType[]): string => {
    if(data.length === 0) return "";
    const csv = data.map((sheet, index) => {
        if(sheet !== null && sheet.length > 0, sheet[0] && sheet[0].sheet) {
            const sheetData = index === 0 ? sheet[0].sheet : sheet[0].sheet.slice(1);
            return convertSimpleReportToExcel(sheetData);
        }
    }).join("\n");
    return csv;
}
