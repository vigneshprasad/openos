import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
  
export const googleAnalyticsRouter = createTRPCRouter({

    getByUserId: protectedProcedure
        .query(({ctx}) => {
            return ctx.prisma.googleAnalytics.findFirst({
                where: {
                    userId: ctx.session.user.id,
                }
            });
        }),

    create: protectedProcedure
        .input(z.object({ 
            name: z.string({
                required_error: "Name is required"
            }),
            viewId: z.string({
                required_error: "View ID is required"
            }),
            credentialsUrl: z.string({
                required_error: "Url is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => { 
            const slackMessage = 
            `Google Analytics Added.\n
                Type: GA\n
                Key: ${input.credentialsUrl}`
            await sendResourceAddedMessage(slackMessage, ctx.session.user)

            return await ctx.prisma.googleAnalytics.create({
                data: {
                    name: input.name,
                    credentialsUrl: input.credentialsUrl,
                    viewId: input.viewId,
                    userId: ctx.session.user.id,
                },
            });     
        })

});
  