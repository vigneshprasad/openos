import { z } from "zod";
import { dummyInsights } from "~/constants/dummyData";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";


export const userPredictionRouter = createTRPCRouter({
    
    thumbsUp: protectedProcedure
        .input(z.object({ 
            id: z.string({
                required_error: "Id is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.userPrediction.update({
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
            return await ctx.prisma.userPrediction.update({
                where: {
                    id: input.id
                },
                data: {
                    feedback: -1
                }
            });
        })
  
});
