import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
  
export const savedQueryRouter = createTRPCRouter({

    thumbsUp: protectedProcedure
        .input(z.object({ 
            id: z.string({
                required_error: "Id is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.savedQuery.update({
                where: {
                    id: input.id
                },
                data: {
                    feedback: 1
                }
            });
        }),

    thumbsDown: protectedProcedure
        .input(z.object({ 
            id: z.string({
                required_error: "Id is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.savedQuery.update({
                where: {
                    id: input.id
                },
                data: {
                    feedback: -1
                }
            });
        })
});
  