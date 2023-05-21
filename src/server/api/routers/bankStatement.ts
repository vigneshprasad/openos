import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
  
export const bankStatementRouter = createTRPCRouter({

    getByUserId: protectedProcedure
        .query(({ctx}) => {
            return ctx.prisma.bankStatement.findFirst({
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
            url: z.string({
            required_error: "Url is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => { 
            const slackMessage = 
            `Bank Statement Added.\n
                Type: Statement\n
                Key: ${input.url}`
            await sendResourceAddedMessage(slackMessage, ctx.session.user)

            return await ctx.prisma.bankStatement.create({
                data: {
                    name: input.name,
                    url: input.url,
                    userId: ctx.session.user.id,
                },
            });     
        })

});
  