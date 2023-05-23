import { NUMBER_OF_RETRIES } from "~/constants/config";
import { prisma } from "~/server/db";
import { executeQuery } from "~/utils/executeQuery";
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
    try {
        const savedQuery = await prisma.savedQuery.findFirst({
            where: {
                databaseResourceId: databaseResource.id,
                name: query,
                feedback: 1
            }
        });

        if(savedQuery) {   
            const result = await executeQuery(databaseResource, savedQuery.query);
            return [
                {
                    query: savedQuery,
                    result: result,
                    name: query
                }, 
                undefined
            ];
        }
    
        const embeddings = await prisma.resourceSchemaEmbeddings.findMany({
            where: {
                databaseResourceId: databaseResource.id
            }
        });

        for(let i = 0; i < NUMBER_OF_RETRIES; i++) {
            sqlQuery = await getQuery(embeddings, query, databaseResource.id, databaseResource.type);
            try {
                const results = await executeQuery(databaseResource, sqlQuery);
                const savedQuery = await prisma.savedQuery.create({
                    data: {
                        databaseResourceId: databaseResource.id,
                        query: sqlQuery,
                        name: query,
                        feedback: 0
                    }
                });

                return [
                    {
                        query: savedQuery,
                        result: results,
                        name: query
                    }, 
                    undefined
                ];
            }
            catch(e) {
                if(i === NUMBER_OF_RETRIES - 1) {
                    return [
                        undefined, 
                        {
                            query: sqlQuery,
                            message: 'An error occured while trying to run your query',
                            cause: e
                        }
                    ]
                }
            }
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