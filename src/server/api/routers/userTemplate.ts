import { z } from "zod";
import { Client } from "pg";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { openai } from '~/server/services/openai'
import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { createContext } from "~/utils/createContext";

type QueryAndResult = {
    query: string;
    result: number;
    name: string;
}

export const userTemplateRouter = createTRPCRouter({
  getMIS: protectedProcedure
    .input(z.object({
        resource: z.string({
            required_error: "Database Resource ID is required"
        }),
        template: z.string({
            required_error: "Template ID is required"
        }),
    }))
    .query(async ({ctx, input}) => {
        const databaseResource = await ctx.prisma.databaseResource.findUnique({
            where: {
                id: input.resource
            }
        })
        if(!databaseResource) {
            return "Database Resource not found"
        }
        const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
        const template = await ctx.prisma.reportTemplate.findUnique({
            where: {
                id: input.template
            }
        })
        if(!template) {
            return "Template not found"
        }

        const fields = await ctx.prisma.reportField.findMany({
            where: {
                templates: {
                    some: {
                        reportTemplateId: template.id
                    },
                },
            },
        });

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

            for(let i = 0; i < fields.length; i++) {
                const field = fields[i];
                let prompt = "### Postgres SQL table with their properties\n#\n";
                if(!field) {
                    continue
                }
                const schemaString = await createContext(
                    field.name,
                    embeddings,
                    1000
                )
                prompt += schemaString;
                const newPrompt = prompt + `### A query to get ${field.name}\n`;
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
                            if(res.rows[0]?.count) {
                                queryAndResult.push({
                                    query: sqlQuery,
                                    result: res.rows[0]?.count,
                                    name: field.name
                                })
                            }
                        }
                        catch(e) {
                            queryAndResult.push({
                                query: sqlQuery,
                                result: -1,
                                name: field.name
                            })
                        }
                    }
                }
            }
            return queryAndResult;

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
