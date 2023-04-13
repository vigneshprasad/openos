import { Client } from "pg";
import type { QueryResult } from "pg";
import { logger } from "~/utils/logger"; 

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
    logger.info({databaseResource: databaseResource, message: 'DB Resource'})
    if(!databaseResources || !databaseResource) {
        return {
            type: DATABASE_QUERY,
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
        console.log("CLIENT", client.port);
        logger.info({port: client.port, message: 'Client'})
        await client.connect();
        logger.info({message: "Client Connected"});
    
        const embeddings = await prisma.resourceSchemaEmbeddings.findMany({
            where: {
                databaseResourceId: databaseResource.id
            }
        });
        logger.info({embeddings: embeddings.length, message: 'Embeddings Done'})

        let prompt = "### Postgres SQL table with their properties\n#\n";
        
        const schemaString = await createContext(
            query,
            embeddings,
            800
        )
        prompt += schemaString;
        const newPrompt = prompt + `### A query to get ${query}\nSELECT`;
        logger.info({prompt: newPrompt, message: 'Prompt'})
        const completion = await openai.createCompletion({
            model: COMPLETIONS_MODEL,
            prompt: newPrompt,
            temperature: 0.7,
            max_tokens: 256,
            stop: ["#", ";"]
        });        
        logger.info({completion: completion, message: 'Completion'})

        if(completion?.data?.choices.length > 0) {
            const text = completion?.data?.choices[0]?.text;
            logger.info({text: text, message: 'Open AI Text'})
            if(text) {
                sqlQuery = "SELECT " + text;
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
        logger.info({error: e, message: 'Error'})
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