import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commandHistoryRouter = createTRPCRouter({
  getAll: protectedProcedure
    .mutation(async ({ ctx }) => {
        return ctx.prisma.commandHistory.findMany({
            where: {
            userId: ctx.session.user.id
            },
            orderBy: [{
            createdAt: "desc"
            }],
            select: {
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                userId: true,
                input: true,
                output: false,
                feedback: true,
                type: true,
                error: true
            },
            take: 30,
        })
    })
});