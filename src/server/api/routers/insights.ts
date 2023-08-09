import { Insights } from "@prisma/client";
import { z } from "zod";
import { dummyActionableInsights, dummyInsights } from "~/constants/dummyData";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";


export const insightsRouter = createTRPCRouter({
    
    getInsights: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model Id is required"
            })  
        }))
        .mutation(async ({ ctx, input }): Promise<Insights[]> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                return dummyInsights;
            }            

            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                return ctx.prisma.insights.findMany({
                    where: {
                        modelId: input.modelId
                    }
                });
            }

            return ctx.prisma.insights.findMany({
                where: {
                    modelId: input.modelId
                }
            });
        }),

    getActionableByInsight: protectedProcedure
        .input(z.object({
            insightId: z.string({
                required_error: "Insight Id is required"
            })  
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                return dummyActionableInsights;
            }     
            
            return ctx.prisma.actionableInsights.findMany({
                where: {
                    insightId: input.insightId
                }
            });
        }),


    thumbsUp: protectedProcedure
        .input(z.object({ 
            id: z.string({
                required_error: "Id is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.insights.update({
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
            return await ctx.prisma.insights.update({
                where: {
                    id: input.id
                },
                data: {
                    feedback: -1
                }
            });
        })
  
});
