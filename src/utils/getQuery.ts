import { type ResourceSchemaEmbeddings } from "@prisma/client";
import { type Client } from "pg";
import { createContext } from "./createContext";
import { openai } from "~/server/services/openai";
import { COMPLETIONS_MODEL } from "~/constants/openAi";

export const getQuery = async (client:Client, embeddings:ResourceSchemaEmbeddings[], query: string) : Promise<string> => {
           
    let prompt = "### Postgres SQL table with their properties\n#\n";
    const schemaString = await createContext(
        query,
        embeddings,
        800
    )
    prompt += schemaString;
    const newPrompt = prompt + `### A query to get ${query}\nSELECT`;
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
            prompt: newPrompt,
            temperature: 0.7,
            max_tokens: 256,
            stop: ["#", ";"]
    });        
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text;
        if(text) {
            const sqlQuery = "SELECT" + text;
            return sqlQuery;
        }
    }
    return '';
}