import { Client } from "pg";
import type { QueryResult } from "pg";

import { prisma } from "~/server/db";

import { type TableRow } from "~/types/types";
import { getQuery } from "~/utils/getQuery";

export const runQuery = async (query: string, userId: string) => {
    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    const databaseResource = databaseResources[0];
    if(!databaseResources || !databaseResource) {
        return [
                undefined, 
                {
                    query: 'Query unprocessed',
                    message: 'No database resource found',
                    cause: 'Please add a database resource to your account to run queries.'
                }
        ];
    }
    let sqlQuery = '';
    const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
    try {
        const client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false, }
        });
        await client.connect();
    
        const embeddings = await prisma.resourceSchemaEmbeddings.findMany({
            where: {
                databaseResourceId: databaseResource.id
            }
        });

        sqlQuery = await getQuery(client, embeddings, query);

        //@TO DO: Use ExecuteQuery here
        try {
            const res: QueryResult<TableRow> = await client.query<TableRow>(
                sqlQuery
            )
            await client.end();
            if(res.rows.length > 0) {
                return [
                    {
                        query: sqlQuery,
                        result: res.rows,
                        name: query
                    }, 
                    undefined
                ];
            }
        }
        catch(e) {
            await client.end();
            return [
                undefined, 
                {
                    query: sqlQuery,
                    message: 'An error occured while trying to run your query',
                    cause: e
                }
            ]
        }

    } catch(e) {
        return [
            undefined, 
            {
                query: sqlQuery,
                message: 'An unexpected error occurred, please try again later.',
                cause: e
            }
        ]
    }
}