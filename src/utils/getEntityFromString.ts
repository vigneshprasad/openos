import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";

type Entity = "order" | "payment" | "refund" | "customer"    

export const getEntityFromString = async (query: string) : Promise<Entity> => {
    let prompt = "What entity is the user trying to get?.\nExample:\n";
    prompt += `What was the order purchased by Rakesh Sharma\Entity: order\n\n`
    prompt += `Number of partial payments made in the last three months\nEntity: payment\n\n`
    prompt += `Refunds processed by Priyanka\nEntity: refund\n\n`
    prompt += `How much did Ashok pay for his last order\nEntity: order\n\n`
    prompt += `Can you tell me how much Naina has paid for their purchases from March\nEntity: payment\n\n`
    prompt += `Total amount due\nEntity: order\n\n`
    prompt += `What is the total fee charged by Razorpay\nEntity: payment\n\n`
    prompt += `How much total amount has been refunded for all my orders\nEntity: refund\n\n`
    prompt += `Who are the users that placed orders recently\nEntity: customer\n\n`
    
    prompt += query + "\nEntity: ";
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
        prompt: prompt,
        temperature: 1,
        max_tokens: 150
    });
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text?.trim();
        if(text) {
            const entity = text as Entity;
            return entity
        }
    } 

    return "order";
}