import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const templateRouter = createTRPCRouter({

  getAll: publicProcedure
    .query(({ ctx }) => {
        return ctx.prisma.reportTemplate.findMany();
    }),

});
