export type QueryResultType = [
    undefined | QueryAndResult,
    undefined | Error
]

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