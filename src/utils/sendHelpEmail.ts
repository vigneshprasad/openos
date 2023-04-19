import { SendEmailRequest } from 'customerio-node'
import { type User } from 'next-auth';
import { client } from '~/server/customerio';


export const sendHelpEmail = (query: string, user: User) => {
    
    const request = new SendEmailRequest({
        to: "vignesh@openos.tools",
        transactional_message_id: "2",
        identifiers: {
            id: "c3ab08000001",
        },
        from: "vivan@openos.tools",
        subject: "User Has Asked For Help",
        body: 
            `User has asked for help with the following query: " + ${query},\n
            User Name: ${user?.name as string}\n
            User Email: ${user?.email as string}\n
            Please help them out!`
    });
    
    client.sendEmail(request)
      .then(res => console.log(res))
      .catch(err => console.log(err))
}
