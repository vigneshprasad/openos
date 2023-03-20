import { z } from "zod";
import { Client } from "pg";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { openai } from '~/server/services/openai'
import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { createContext } from "~/utils/createContext";

type TableRow = {
    [key: string]: string | number | boolean | null;
}

type QueryAndResult = {
    query: string;
    count: number;
    result: TableRow[];
    name: string;
}

export const queryRouter = createTRPCRouter({
  runQuery: protectedProcedure
    .input(z.object({
        query: z.string({
            required_error: "Query is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const databaseResources = await ctx.prisma.databaseResource.findMany({
            where: {
                userId: ctx.session.user.id
            }
        })
        if(!databaseResources) {
            return "Database Resource not found"
        }
        if(databaseResources.length > 1) {
            return "Multiple Database Resources found"
        }
        const databaseResource = databaseResources[0];
        if(!databaseResource) {
            return "Database Resource not found"
        }
        const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
    
        try {
            const client = new Client({
                connectionString: dbUrl,
                ssl: { rejectUnauthorized: false, }
            });
            await client.connect();

            const embeddings = await ctx.prisma.resourceSchemaEmbeddings.findMany({
                where: {
                    databaseResourceId: databaseResource.id
                }
            });

            const queryAndResult: QueryAndResult[] = [];

            let prompt = "### Postgres SQL table with their properties\n#\n";

            const schemaString = await createContext(
                input.query,
                embeddings,
                1000
            )
            prompt += schemaString;
            const newPrompt = prompt + `### A query to get ${input.query}\n`;
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
                    const sqlQuery = text;
                    try {
                        const res = await client.query<{count:number}>(
                            sqlQuery
                        )
                        console.log(res.rows);
                        if(res.rows.length > 1) {
                            return {
                                query: sqlQuery,
                                result: res.rows,
                            };
                        }
                        if(res.rows[0]?.count) {
                            return {
                                query: sqlQuery,
                                count: res.rows[0]?.count,
                            };
                        }
                        console.log(res.rows);
                    }
                    catch(e) {
                        return {
                            query: sqlQuery,
                            result: -1,
                        };
                    }
                        
                }
                return queryAndResult;
            }
        } catch(e) {
            console.error("Error", e)
        }
    }),

  getAll: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.databaseResource.findMany({
        where: {
          userId: ctx.session.user.id,
        }
      });
    }),

});
