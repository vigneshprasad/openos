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

type TableRow = {
    [key: string]: string | number | boolean | null;
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
        let sqlQuery = "";
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
                    sqlQuery = text;
                    try {
                        const res: QueryResult<TableRow> = await client.query<TableRow>(
                            sqlQuery
                        )

                        await client.end();
                        if(res.rows.length > 0) {
                            return {
                                success: true,
                                query: sqlQuery,
                                result: res.rows,
                            };
                        }
                    }
                    catch(e) {
                        await client.end();
                        return {
                            success: false,
                            query: sqlQuery,
                            message: 'An error occurred while trying to run your query.',
                            description: e
                        };
                    }
                        
                }
                return {
                    query: sqlQuery,
                    result: []
                }
            }
        } catch(e) {
            return {
                success: false,
                query: sqlQuery, 
                message: 'An unexpected error occurred, please try again later.',
                description: e
            }
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
