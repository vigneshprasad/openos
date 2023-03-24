import { z } from "zod";
import { Client } from "pg";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { convertSchemaToStringArray } from "~/utils/convertSchemaToStringArray";

import { openai } from '~/server/services/openai'
import { EMBEDDINGS_MODEL } from "~/constants/openAi";
import { type Prisma } from "@prisma/client";

type Schema = { 
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
}

export const databaseResourceRouter = createTRPCRouter({
    
  getAll: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.databaseResource.findMany({
        where: {
          userId: ctx.session.user.id,
        }
      });
    }),

  create: protectedProcedure
    .input(z.object({ 
        name: z.string({
          required_error: "Name is required"
        }),
        type: z.string({
          required_error: "Type is required"
        }),
        host: z.string({
          required_error: "Host is required"
        }),
        port: z.number({
          required_error: "Port is required"
        }),
        dbName: z.string(),
        dbUsername: z.string(),
        dbPassword: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        const dbUrl = `postgresql://${input.dbUsername}:${input.dbPassword}@${input.host}:${input.port}/${input.dbName}?sslmode=require`;
        const client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false, }
        });
        await client.connect();
        try {
            const client = new Client({
                connectionString: dbUrl,
                ssl: { rejectUnauthorized: false, }
            });
            await client.connect();
            const sqlQuery = "SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema='public'"
            const res = await client.query<Schema>(
                sqlQuery
            )
            await client.end();
            const databaseResource = await ctx.prisma.databaseResource.create({
                data: {
                    name: input.name,
                    host: input.host,
                    port: input.port,
                    type: input.type,
                    dbName: input.dbName,
                    username: input.dbUsername,
                    password: input.dbPassword,
                    userId: ctx.session.user.id,
                    status: false,
                },
            });
            const tables = convertSchemaToStringArray(res.rows);
            for(let i = 0; i < tables.length; i++) {
                if(tables[i]) {
                    const res = await openai.createEmbedding({
                        model: EMBEDDINGS_MODEL,
                        input: String(tables[i]),
                    });
                    const json = res.data.data[0]?.embedding as Prisma.JsonArray
                    await ctx.prisma.resourceSchemaEmbeddings.create({
                        data: {
                            name: String(tables[i]),
                            databaseResourceId: String(databaseResource.id),
                            embeddings: json,
                        }
                    })
                }
            }
        } catch(e) {
            console.error("Error", e)
            await client.end();
            return "Could not create database";
        }
    })
});
