import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";

export type DateRange = {
    from: Date | undefined,
    to: Date | undefined
}

type DateRangeStrings = {
    from: string,
    to: string
}

export const getDateRangeFromString = async (query: string) : Promise<DateRange | undefined> => {

    let prompt = `Consider today's date range as ${new Date().toDateString()}.`;
    prompt += "Extract a date range in this statement. If no date mention undefined in both from and to values.\nExample:\n";
    const now = new Date();
    const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const lastWeekJson = {
        from: lastWeek.toLocaleString(),
        to: now.toLocaleString()
    }
    const lastMonthJson = {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toString(),
        to: new Date(now.getFullYear(), now.getMonth(), 0).toString()
    }

    const lastYearJson = {
        from: new Date(now.getFullYear() - 1, 1, 1).toString(),
        to: new Date(now.getFullYear() - 1, 12, 31).toString()
    }

    const fifthJuneJson = {
        from: new Date(now.getFullYear() - 1, 6, 5).toString(),
        to: new Date(now.getFullYear() - 1, 6, 6).toString()
    }

    prompt += `What was the total order value for last week\n${JSON.stringify(lastWeekJson)}\n\n`
    prompt += `Amount for orders placed last month\n${JSON.stringify(lastMonthJson)}\n\n`
    prompt += `What was the number of orders last year\n${JSON.stringify(lastYearJson)}\n\n`
    prompt += `What was the amount paid for orders placed on 5th June by Ganesh\n${JSON.stringify(fifthJuneJson)}\n`
    prompt += `List of orders by Rakesh\n{"from": "undefined", "to":"undefined"}\n`
    prompt += query;
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 150
    });
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text;
        if(text) {
            try {
                const dateJson = JSON.parse(text) as DateRangeStrings;
                const dateRange = {
                    from: dateJson.from !== "undefined" ? new Date(dateJson?.from) : undefined,
                    to: dateJson.to !== "undefined" ? new Date(dateJson?.to) : undefined
                }
                return(dateRange);
            } catch(e) {
                console.log(e);
                return undefined;
            }
            
        }
    } 
}