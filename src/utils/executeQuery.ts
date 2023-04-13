import { type Client, type QueryResult } from "pg";
import { type TableRow } from "~/types/types";

export const executeQuery = async (client:Client, sqlQuery: string) : Promise<TableRow[]> => {
    const res: QueryResult<TableRow> = await client.query<TableRow>(
        sqlQuery
    )

    if(res.rows.length > 0) {
        return res.rows
    }
    return [];
}
