import { type ResourceSchemaEmbeddings } from "@prisma/client";
import moment from "moment";
import { type Client } from "pg";
import { getQuery } from "./getQuery";

export const processPrompt = async (
    query: string, 
    client:Client, 
    embeddings:ResourceSchemaEmbeddings[], 
    timeSeries: Date[], 
    databaseResourceId: string,
    removeDate?: boolean
): Promise<string> => {
    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");

    let prompt;
    if(removeDate) {
        prompt = query;
    } else {
        prompt = query + ` from ${timeSeries0} to ${timeSeries1}`
    }
    const sqlQuery = await getQuery(client, embeddings, prompt, databaseResourceId);
    return sqlQuery;
}
