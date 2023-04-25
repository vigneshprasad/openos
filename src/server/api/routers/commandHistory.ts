import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commandHistoryRouter = createTRPCRouter({
  getAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      return ctx.prisma.commandHistory.findMany({
        where: {
          userId: ctx.session.user.id
        }
      })
    })
})