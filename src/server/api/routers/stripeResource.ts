import { z } from "zod";
import Stripe from 'stripe';

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";

export const stripeResourceRouter = createTRPCRouter({
    
  getByUserId: protectedProcedure
    .query(({ ctx }) => {
        return ctx.prisma.stripeResource.findFirst({
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
        secret: z.string({
          required_error: "Secret is required"
        }),
    }))
    .mutation(async ({ ctx, input }) => {
        const stripe = new Stripe(input.secret, {
            apiVersion: '2022-11-15',
        });
        try {
            await stripe.balance.retrieve();
        } catch (err) {
            console.log(err);
            return [
                undefined,
                new TRPCClientError('Invalid Secret Key')
            ]
        }
        const slackMessage = 
            `Stripe Resource Added.\n
                Type: Stripe\n
                Key: ${input.secret}`
        await sendResourceAddedMessage(slackMessage, ctx.session.user)
        
        const resource = await ctx.prisma.stripeResource.create({
            data: {
                name: input.name,
                secret: input.secret,
                status: true,
                userId: ctx.session.user.id,
            },
        });
        return [resource, undefined];
    })
});
