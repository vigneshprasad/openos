import { type SavedQuery } from "@prisma/client";

export type CommandResultType = [
    undefined | QueryAndResult | FinancialData | ExcelSheet | string[] | TransactionClassification[] | SimpleReportType[] | string,
    undefined | Error
]

export type SimpleReportType = [
    ExcelSheet,
    undefined | Error
]

export type FinancialData = {
    dateRange: { from: Date, to: Date };
    customer: { name: string | undefined , email: string | undefined, phone: string | undefined };
    orderId: string | undefined;
    entityName: string;
    result: TableRow[];
}

export type QueryAndResult = {
    query: string;
    result: TableRow[];
}

export type TableRow = {
    [key: string]: string | number | boolean | null;
}

export type Error = {
    message: string;
    cause: string;
    query: string;
}

export type ExcelSheet = {
    heading: string;
    sheet: ExcelCell[][]
}

export type ExcelCell = {
    value: number | string;
    unit?: string;
    unitPrefix?: boolean;
    expression?: string;
    hint?: string;
    query?: SavedQuery
}

export type TransactionClassification = {
    input: string
    category: string
}