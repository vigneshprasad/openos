export type CommandResultType = [
    undefined | QueryAndResult | JsonData | ExcelCell[][] | string[] | TransactionClassification[],
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

export type ExcelCell = {
    value: number | string;
    expression?: string;
    hint?: string;
}

export type TransactionClassification = {
    input: string
    category: string
}