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
      const stage3 = !user?.isOnboarded

      return {
        stage1,
        stage2,
        stage3,
        user,
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