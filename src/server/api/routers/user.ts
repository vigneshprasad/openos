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
          BankStatement: true
        }
      })

      const stage1 = !user?.name || !user.role
      const stage2 = !user?.BankStatement && !user?.DatabaseResource && !user?.RazorpayResource

      return {
        stage1,
        stage2,
        user,
      }
    }),
  
  update: protectedProcedure
    .input(z.object({
      name: z.string({
        required_error: "Name is required"
      }),
      role: z.string({
        required_error: "Role is required"
      })
    }))
    .mutation(async ({ctx, input}) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id
        },
        data: {
          name: input.name,
          role: input.role,
        }
      })
    })
})