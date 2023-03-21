import { z } from "zod";
import { Client} from "pg";
import type { QueryResult } from "pg";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { openai } from '~/server/services/openai'
import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { createContext } from "~/utils/createContext";
import { TRPCError } from "@trpc/server";

type TableRow = {
    [key: string]: string | number | boolean | null;
}

type TableCount = {
    count: number;
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
                        const res: QueryResult<TableCount | TableRow> = await client.query<TableCount | TableRow>(
                            sqlQuery
                        )

                        await client.end();
                        if(res.rows.length > 1) {
                            return {
                                query: sqlQuery,
                                result: res.rows,
                            };
                        }
                        if((res.rows[0] as TableCount).count) {
                            return {
                                query: sqlQuery,
                                count: (res.rows[0] as TableCount).count,
                            };
                        }
                        console.log(res.rows);
                    }
                    catch(e) {
                        console.error("Error", e);
                        await client.end();
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'An unexpected error occurred, please try again later.',
                            cause: e,
                        });
                    }
                        
                }
                return queryAndResult;
            }
        } catch(e) {
            console.error("Error", e)
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred, please try again later.',
                cause: e,
            });
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
