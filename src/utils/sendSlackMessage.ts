import axios from "axios";
import { type User } from "next-auth";

export const sendHelpMessage = async (query: string, user: User) => {

    const url =  "https://slack.com/api/chat.postMessage";
    const res = await axios.post(url, {
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

    console.log(res);
    console.log(res.data);

}