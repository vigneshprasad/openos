import { Client } from "pg";
import type { QueryResult } from "pg";

import { prisma } from "~/server/db";
import { openai } from "../services/openai";

import { createContext } from "~/utils/createContext";

import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { DATABASE_QUERY } from "~/constants/commandConstants";
import { type TableRow } from "~/types/types";


export const runQuery = async (query: string, userId: string) => {
    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    const databaseResource = databaseResources[0];
    if(!databaseResources || !databaseResource) {
        return {
            type: "DATABASE_QUERY",
            data: [
                undefined, 
                {
                    query: 'Query unprocessed',
                    message: 'No database resource found',
                    cause: 'Please add a database resource to your account to run queries.'
                }
            ]
        };
    }
    const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
    let sqlQuery = "";
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
    
        let prompt = "### Postgres SQL table with their properties\n#\n";
    
        const schemaString = await createContext(
            query,
            embeddings,
            1000
        )
        prompt += schemaString;
        const newPrompt = prompt + `### A query to get ${query}\n`;
        const completion = await openai.createCompletion({
            model: COMPLETIONS_MODEL,
            prompt: newPrompt,
            temperature: 1,
            max_tokens: 150,
            stop: ["#", ";"]
        });
        if(completion?.data?.choices.length > 0) {
            const text = completion?.data?.choices[0]?.text;
            if(text) {
                sqlQuery = text;
                try {
                    const res: QueryResult<TableRow> = await client.query<TableRow>(
                        sqlQuery
                    )
    
                    await client.end();
                    if(res.rows.length > 0) {
                        return {
                            type: DATABASE_QUERY,
                            data: [
                                {
                                    query: sqlQuery,
                                    result: res.rows,
                                    name: query
                                }, 
                                undefined
                            ]
                        };
                    }
                }
                catch(e) {
                    await client.end();
                    return {
                        type: DATABASE_QUERY,
                        data: [
                            undefined, 
                            {
                                query: sqlQuery,
                                message: 'An error occured while trying to run your query',
                                cause: e
                            }
                        ]
                    };
                }
                    
            }
            return {
                type: DATABASE_QUERY,
                data: [
                    {
                        query: sqlQuery,
                        result: [],
                        name: query
                    }, 
                    undefined
                ]
            };
        }
    } catch(e) {
        return {
            type: DATABASE_QUERY,
            data: [
                undefined, 
                {
                    query: sqlQuery,
                    message: 'An unexpected error occurred, please try again later.',
                    cause: e
                }
            ]
        };
    }

}