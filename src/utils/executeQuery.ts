import { type DatabaseResource } from "@prisma/client";
import { Client, type QueryResult } from "pg";
import { MYSQL, POSTGRES } from "~/constants/dbTypes";
import { type TableRow } from "~/types/types";
import mysql from 'mysql';
import util from 'util';

export const executeQuery = async (databaseResource:DatabaseResource, sqlQuery: string) : Promise<TableRow[]> => {
    console.log("EXECUTE QUERY", databaseResource, sqlQuery);
    switch(databaseResource.type) {
        case POSTGRES:
            return await executePostgres(databaseResource, sqlQuery);
        case MYSQL:
            return await executeMySql(databaseResource, sqlQuery);
    }
    
    return [];
}

const executePostgres = async (databaseResource:DatabaseResource, sqlQuery: string) : Promise<TableRow[]> => {
    const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false, }
    });
    await client.connect();
    const res: QueryResult<TableRow> = await client.query<TableRow>(
        sqlQuery
    )
    await client.end();
    
    if(res.rows.length > 0) {
        return res.rows
    }
    return [];
}

const executeMySql = async (databaseResource:DatabaseResource, sqlQuery: string) : Promise<TableRow[]> => {
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
    const fn = util.promisify(client.query).bind(client);
    const results = await fn(sqlQuery);
    const string = JSON.stringify(results);
    const rows =  JSON.parse(string) as TableRow[];
    client.end();

    if(rows.length > 0) {
        return rows
    }
    return [];
}
