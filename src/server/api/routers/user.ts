import { createTRPCRouter, protectedProcedure } from "../trpc";
import {z} from "zod";

export const userRouter = createTRPCRouter({
    isNewUser: protectedProcedure
        .mutation(async ({ctx}) => {
            const user = await ctx.prisma.user.findFirst({
                where: {
                    id: ctx.session.user.id
                },
                include: {
                    DatabaseResource: true,
                    RazorpayResource: true,
                    BankStatement: true,
                    StripeResource: true,
                    MixpanelResource: true,
                    GoogleAnalytics: true
                }
            })

            const stage1 = !user?.name || !user.role
            const stage2 = 
                user?.BankStatement.length === 0 &&
                user?.DatabaseResource.length === 0 &&
                user?.RazorpayResource.length === 0 &&
                user?.StripeResource.length === 0 &&
                user?.MixpanelResource.length === 0 &&
                user?.GoogleAnalytics.length === 0 

            const stage3 = !user?.isOnboarded

            return {
                stage1,
                stage2,
                stage3,
                user,
            }
        }),

    integrationList: protectedProcedure
        .query(async ({ctx}) => {
            const user = await ctx.prisma.user.findFirst({
                where: {
                    id: ctx.session.user.id
                },
                include: {
                    DatabaseResource: true,
                    RazorpayResource: true,
                    BankStatement: true,
                    StripeResource: true,
                    MixpanelResource: true,
                    GoogleAnalytics: true
                }
            })

            return {
                database: user?.DatabaseResource.length !== 0,
                razorpay: user?.RazorpayResource.length !== 0,
                bankStatement: user?.BankStatement.length !== 0,
                stripe: user?.StripeResource.length !== 0,
                mixpanel: user?.MixpanelResource.length !== 0,
                googleAnalytics: user?.GoogleAnalytics.length !== 0,
            }
        }),
  
    update: protectedProcedure
        .input(z.object({
            name: z.string({
                required_error: "Name is required",
            }),
            role: z.string({
                required_error: "Role is required"
            })
        }))
        .mutation(async ({ctx, input}) => {
            if (input.name.length == 0 || input.role.length == 0) {
                return [undefined, {
                    error: true,
                }]
            }

            const user = await ctx.prisma.user.update({
                where: {
                id: ctx.session.user.id
            },
                data: {
                name: input.name,
                role: input.role,
            }
        })

        return [user, undefined]
    })
})