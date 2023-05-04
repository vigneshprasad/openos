import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";


export const databaseResourceRouter = createTRPCRouter({
    
  getAll: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.databaseResource.findMany({
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
        type: z.string({
          required_error: "Type is required"
        }),
        host: z.string({
          required_error: "Host is required"
        }),
        port: z.number({
          required_error: "Port is required"
        }),
        dbName: z.string(),
        dbUsername: z.string(),
        dbPassword: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.databaseResource.create({
            data: {
                name: input.name,
                host: input.host,
                port: input.port,
                type: input.type,
                dbName: input.dbName,
                username: input.dbUsername,
                password: input.dbPassword,
                userId: ctx.session.user.id,
                status: false,
            },
        });
    })
});
