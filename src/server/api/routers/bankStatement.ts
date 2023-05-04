import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
  
export const bankStatementRouter = createTRPCRouter({

    create: protectedProcedure
        .input(z.object({ 
            name: z.string({
            required_error: "Name is required"
            }),
            url: z.string({
            required_error: "Url is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.bankStatement.create({
                data: {
                    name: input.name,
                    url: input.url,
                    userId: ctx.session.user.id,
                },
            });     
        })

});
  