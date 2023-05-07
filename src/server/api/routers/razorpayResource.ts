import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const razorpayResourceRouter = createTRPCRouter({
    
  getByUserId: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.razorpayResource.findFirst({
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
        keyId: z.string({
          required_error: "Key ID is required"
        }),
        keySecret: z.string({
          required_error: "Key Secret is required"
        }),
        accountNumber: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.razorpayResource.create({
            data: {
                name: input.name,
                key_id: input.keyId,
                key_secret: input.keySecret,
                status: true,
                userId: ctx.session.user.id,
                account_number: input.accountNumber
            },
        });
    })
});
