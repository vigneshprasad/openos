import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
import { TRPCClientError } from "@trpc/client";

export const amplitudeResourceRouter = createTRPCRouter({
    
  getByUserId: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.amplitudeResource.findFirst({
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
        apiKey: z.string({
          required_error: "API Key is required"
        }),
        secretKey: z.string({
          required_error: "Secret Key is required"
        }),
        region: z.string({
            required_error: "Region is required"
        }),
    }))
    .mutation(async ({ ctx, input }) => { 
        const authorizationString = `${input.apiKey}:${input.secretKey}`
        const encodedString = Buffer.from(authorizationString).toString('base64')
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              authorization: `Basic ${encodedString}=`
            }
        };

        const region = input.region === 'EU' ? "analytics.eu.amplitude.com" : "amplitude.com"
        const url = `https://${region}/api/2/export?start=20230727T00&end=20230729T00`
        console.log("BRUV : ", url);
        const response = await fetch(url, options)
        if(response.status !== 200) {
            console.log(response);
            return [
                undefined,
                new TRPCClientError(`Invalid Credentials`)
            ]
        }

        const slackMessage = 
            `Amplitude Resource Added.\n
                Type: Amplitude\n
                Key: ${input.projectId}`
        await sendResourceAddedMessage(slackMessage, ctx.session.user)
        
        const resource = await ctx.prisma.amplitudeResource.create({
            data: {
                project_id: input.projectId,
                apiKey: input.apiKey,
                secretKey: input.secretKey,
                status: true,
                userId: ctx.session.user.id,
                region: input.region,
            },
        });

        return [resource, undefined];
    })
});
