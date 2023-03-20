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
  getPostgresSchema: protectedProcedure
    .query(async () => {
        // const dbUrl = `postgresql://${input.dbUsername}:${input.dbPassword}@${input.host}:${input.port}/${input.dbName}?sslmode=require`;
        const dbUrl = 'postgres://breucpiwudpfts:71968ba018ea57518792b4e20bf4d3c541173467199a116b347a33c1d6df18db@ec2-54-170-90-26.eu-west-1.compute.amazonaws.com:5432/d4pijnt26qbrav'

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
          return res;
        } catch(e) {
          console.error("Error", e)
          return "An unexpected error occured";
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
        // const dbUrl = `postgresql://${input.dbUsername}:${input.dbPassword}@${input.host}:${input.port}/${input.dbName}?sslmode=require`;
        const dbUrl = `postgresql://postgres:0g-Yquy1-Vsofko-zik7yz=31TQfPh@worknetwork-api-dev-db-database.cof0pxz5maxa.ap-south-1.rds.amazonaws.com:5432/worknetworkapidevdb?sslmode=require`;
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
            console.log(tables);
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
            return "Could not create database";
        }
    })
});
