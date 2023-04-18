import { type SavedQuery } from "@prisma/client";

export type CommandResultType = [
    undefined | QueryAndResult | JsonData | ExcelSheet | string[] | TransactionClassification[] | SimpleReportType[],
    undefined | Error
]

export type SimpleReportType = [
    ExcelSheet,
    undefined | Error
]

export type JsonData = {
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

export type ExcelSheet = ExcelCell[][]

export type ExcelCell = {
    value: number | string;
    expression?: string;
    hint?: string;
    query?: SavedQuery
}

export type TransactionClassification = {
    input: string
    category: string
}