import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";

type CustomerDetails = {
    name: string | undefined,
    email: string | undefined,
    phone: string | undefined,    
}

export const getCustomerFromString = async (query: string) : Promise<CustomerDetails> => {

    const CustomerDetails: CustomerDetails = {
        name: undefined,
        email: undefined,
        phone: undefined
    }
    let prompt = "Extract a name in this statement. If no customer mention undefined.\nExample:\n";
    prompt += `What was the order purchased by Rakesh Sharma\nName: Rakesh Sharma\n\n`
    prompt += `Amount for orders placed last month\nName: undefined\n\n`
    prompt += `Refunds processed by Priyanka\nName: Priyanka\n\n`
    prompt += query + "\nName: ";
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
        prompt: prompt,
        temperature: 1,
        max_tokens: 150
    });
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text?.trim();
        if(text) {
            if(text && text !== "undefined") {
                CustomerDetails.name = text;
            }
        }
    } 

    const emailList = query.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if(emailList && emailList.length > 0) {
        CustomerDetails.email = emailList[0];
    }

    const removedSpace = query.replace(/\s/g, '');
    const phoneList = removedSpace.match(/(\d{10})/g);
    if(phoneList && phoneList.length > 0) {
        CustomerDetails.phone = phoneList[0];
    }

    return CustomerDetails;
}