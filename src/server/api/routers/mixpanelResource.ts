import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
import { TRPCClientError } from "@trpc/client";

export const mixpanelResourceRouter = createTRPCRouter({
    
  getByUserId: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.mixpanelResource.findFirst({
        where: {
          userId: ctx.session.user.id,
        }
      });
    }),

  create: protectedProcedure
    .input(z.object({ 
        projectId: z.string({
          required_error: "Project ID is required"
        }),
        username: z.string({
          required_error: "Username is required"
        }),
        secret: z.string({
          required_error: "Secret is required"
        }),
        region: z.string({
            required_error: "Region is required"
        }),
    }))
    .mutation(async ({ ctx, input }) => { 
        const authorizationString = `${input.username}:${input.secret}`
        const encodedString = Buffer.from(authorizationString).toString('base64')
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              authorization: `Basic ${encodedString}=`
            }
        };

        const url = input.region === 'EU' ? "eu.mixpanel" : "mixpanel"
        const response = await fetch(`https://${url}.com/api/2.0/events/names?project_id=${input.projectId}&type=general`, options)
        if(response.status !== 200) {
            return [
                undefined,
                new TRPCClientError(`Invalid Credentials`)
            ]
        }

        const slackMessage = 
            `Mixpanel Resource Added.\n
                Type: Mixpanel\n
                Key: ${input.projectId}`
        await sendResourceAddedMessage(slackMessage, ctx.session.user)
        
        const resource = await ctx.prisma.mixpanelResource.create({
            data: {
                project_id: input.projectId,
                username: input.username,
                password: input.secret,
                status: true,
                userId: ctx.session.user.id,
                region: input.region,
            },
        });

        return [resource, undefined];
    })
});
