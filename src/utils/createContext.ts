import { type ResourceSchemaEmbeddings } from "@prisma/client"
import { EMBEDDINGS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";

type Score = {
    score: number;
    embedding: string;
}

export const createContext = async (
    question: string,
    embeddingObjects: ResourceSchemaEmbeddings[],
    maxLength: number,
):Promise<string> => {
    
    const res = await openai.createEmbedding({
        model: EMBEDDINGS_MODEL,
        input: question,
    });

    const scores: Score[] = [];

    for(let i = 0; i < embeddingObjects.length; i++) {
        if(res.data.data[0]?.embedding && embeddingObjects[i]?.embeddings) {
            const embeddings = embeddingObjects[i]?.embeddings as number[];
            const score = cosineSimilarity(res.data.data[0].embedding, embeddings);
            scores.push({score, embedding: String(embeddingObjects[i]?.name)})
        }
    }

    scores.sort((a, b) => b.score - a.score);

    let schemaString = ""
    for(let i = 0; i < scores.length; i++) {
        const embeddingName = scores[i]?.embedding;
        if(!embeddingName) continue;
        if((schemaString.length + embeddingName?.length) > maxLength) {
            return schemaString;
        }
        schemaString += `# ${embeddingName}`
    }
    return schemaString
    
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += Number(a[i]) * Number(b[i]);
        magA += Number(a[i]) * Number(a[i]);
        magB += Number(b[i]) * Number(b[i]);
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    // compute cosine similarity
    return dotProduct / (magA * magB);
}