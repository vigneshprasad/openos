import { type Prisma } from ".prisma/client";
import { Client } from "pg";
import { EMBEDDINGS_MODEL } from "../src/constants/openAi";
import { prisma } from "../src/server/db";
import { openai } from "../src/server/openai";
import { convertMySQLSchemaToStringArray, convertPostgresSchemaToStringArray } from "../src/utils/convertSchemaToStringArray";
import { processBankStatement } from "~/utils/processBankStatement";
import mysql from 'mysql';
import util from 'util';

type Schema = { 
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
}

type MySQLSchema = { 
    TABLE_NAME: string;
    COLUMN_NAME: string;
    DATA_TYPE: string;
}
  
const createPostgresSchemaEmbeddings = async (databaseResourceId: string) => {
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
    let client;
    try {
        client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false, }
        });
        await client.connect();
        const sqlQuery = "SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema='public'"
        const res = await client.query<Schema>(
            sqlQuery
        )
        await client.end();
        const tables = convertPostgresSchemaToStringArray(res.rows);
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
        if(client) {
            await client.end();
        }
        console.log("Could not create database");
        return;
    }
}

const createTransactionsFromBankStatement = async(bankStatementId: string) => {
    const bankStatement = await prisma.bankStatement.findUnique({
        where: {
            id: bankStatementId
        }
    });

    if(!bankStatement) {
        console.log('No bank statement found')
        return;
    }
    await processBankStatement(bankStatement, bankStatement?.userId, bankStatement?.id)
}

const createMySQLSchemaEmbeddings = async (databaseResourceId: string) => {
    const databaseResource = await prisma.databaseResource.findUnique({
        where: {
            id: databaseResourceId
        }
    })
    
    if(!databaseResource) { 
        return 
    }

    let client;
    try {
        const client = mysql.createConnection({
            host     : databaseResource.host,
            user     : databaseResource.username,
            password : databaseResource.password,
            database : databaseResource.dbName,
            ssl  : {
                rejectUnauthorized: false
            }
        });

         
        client.connect();
        const sqlQuery = "SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='openos'"

        const fn = util.promisify(client.query).bind(client);
        const results = await fn(sqlQuery);
        const string = JSON.stringify(results);
        const json =  JSON.parse(string) as MySQLSchema[];
        const tables = convertMySQLSchemaToStringArray(json);
        client.end();
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
        if(client) {
            // client.end();
        }
        console.log("Could not create database");
        return;
    }
}

const printDBResources = async () => {
    const databaseResources = await prisma.databaseResource.findMany({});

    for(const databaseResource of databaseResources) {
        const user = await prisma.user.findUnique({
            where: {
                id: databaseResource.userId
            }
        });
        console.log(user?.email);
        console.log(user?.name);
        console.log("HOST:", databaseResource.host);
        console.log("TYPE:", databaseResource.type);
        console.log("===========");
    }
}

const printUsers = async () => {
    const sessions = await prisma.session.findMany({
        orderBy: {
            expires: 'desc'
        }
    });
    for(const session of sessions) {
        const user = await prisma.user.findUnique({
            where: {
                id: session.userId
            }
        });
        console.log(user?.email, "#", session.expires);
        console.log("===========");
    }

}

// void createPostgresSchemaEmbeddings('clhsqjk8x0007ml0fp85re5dw');
// void createMySQLSchemaEmbeddings('cli0gswve00009knpq3cb8zo4');
// void createTransactionsFromBankStatement('clhsqpu2f0009ml0fqjyivs0y');