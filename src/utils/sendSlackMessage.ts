import axios, { type AxiosResponse } from "axios";
import { type User } from "next-auth";

export const sendHelpMessage = async (query: string, user: User) => {

    const url =  "https://slack.com/api/chat.postMessage";
    const res:AxiosResponse = await axios.post(url, {
        channel: "#help",
        text: 
            `User has asked for help with the following query: \n 
            ${query}\n
            User Name: ${user?.name as string}\n
            User Email: ${user?.email as string}\n
            Please help them out!`
    }, { 
        headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN as string}`
        }
    });

    const message = res.status == 200 ? 
        "Your query has been sent to our analysts. We will get back to you shortly."
        : "Unfortunately an error occured and we were not able to send your query. Please try again later."
    return message;

}