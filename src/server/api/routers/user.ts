import { createTRPCRouter, protectedProcedure } from "../trpc";
import {z} from "zod";

export const userRouter = createTRPCRouter({
  
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
          // role: input.role,
        }
      })
    })
})