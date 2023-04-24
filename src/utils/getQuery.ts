import { type ResourceSchemaEmbeddings } from "@prisma/client";
import { type Client } from "pg";
import { createContext } from "./createContext";
import { openai } from "~/server/services/openai";
import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { prisma } from "~/server/db";

export const getQuery = async (client:Client, embeddings:ResourceSchemaEmbeddings[], query: string, databaseResourceId: string) : Promise<string> => {
           
    let prompt = "### Postgres SQL table with their properties\n#\n";
    const schemaString = await createContext(
        query,
        embeddings,
        800
    )
    prompt += schemaString;
    const promptAdditions = await prisma.sQLQueryPromptAddition.findMany({
        where: {
            databaseResourceId: databaseResourceId
        }
    });

    if(promptAdditions.length > 0) {
        prompt += "Keep in mind the following\n";
        promptAdditions.forEach((promptAddition) => {
            prompt += `- ${promptAddition?.rules}\n`;
        });
    }
    const newPrompt = prompt + `### A query to get ${query}\nSELECT`;

    console.log(newPrompt);

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
            let sqlQuery = "SELECT" + text;

            const sqlQueryModifications = await prisma.sQLQueryModification.findMany({
                where: {
                    databaseResourceId: databaseResourceId
                }
            });

            if(sqlQueryModifications.length > 0) {
                sqlQueryModifications.forEach((sqlQueryModification) => {
                    sqlQuery = sqlQuery.replace(sqlQueryModification.queryValue, sqlQueryModification.replacementValue);
                });
            }

            console.log(sqlQuery);

            return sqlQuery;
        }
    }
    return '';
}