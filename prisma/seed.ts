import { type Prisma } from ".prisma/client";
import { Client } from "pg";
import { EMBEDDINGS_MODEL } from "~/constants/openAi";
import { prisma } from "~/server/db";
import { openai } from "~/server/openai";
import { convertSchemaToStringArray } from "~/utils/convertSchemaToStringArray";

type Schema = { 
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
}
  
const seedDatabase = async (databaseResourceId: string) => {
    const databaseResource = await prisma.databaseResource.findUnique({
        where: {
            id: databaseResourceId
        }
    })
    
    if(!databaseResource) { 
        console.log('No database resource found')
        return 
    }

    const dbUrl = `postgresql://${databaseResource.username}:${databaseResource.password}@${databaseResource.host}:${databaseResource.port}?sslmode=require`;
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
        const tables = convertSchemaToStringArray(res.rows);
        for(let i = 0; i < tables.length; i++) {
            if(tables[i]) {
                const res = await openai.createEmbedding({
                    model: EMBEDDINGS_MODEL,
                    input: String(tables[i]),
                });
                const json = res.data.data[0]?.embedding as Prisma.JsonArray
                await prisma.resourceSchemaEmbeddings.create({
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
        console.log("Could not create database");
        return;
    }
}