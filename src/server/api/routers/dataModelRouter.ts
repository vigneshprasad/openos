import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { dummyChurnByDate, dummyChurnGraph, dummyCohortsData, dummyFeatures, dummyModel } from "~/constants/dummyData";

type Cohort = {
    name: string,
    predictedChurn: number,
    actualChurn: number,
    deviation: number,
    userList: string,
}

type Churn = {
    date: string,
    users: number,
    predictedChurn: number,
    actualChurn?: number
}

export const dataModelRouter = createTRPCRouter({
    getModels: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyModel;
            }            

            return ctx.prisma.dataModel.findMany({
                where: {
                    userId: ctx.session.user.id,
                }
            });
        }),

    getFeatures: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model Id is required"
            })  
        }))
        .query(async ({ctx, input}) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyFeatures;
            }  
            return ctx.prisma.featureImportance.findMany({
                where: {
                    dataModelId: input.modelId, 
                }
            })
        }),

    getChurnGraph: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            featureId: z.string({
                required_error: "Feature ID is required"
            }),
            date: z.date({
                required_error: "Date is required"
            })
        }))    
        .query(async ({ctx, input}) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyChurnGraph;
            }  
            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                    createdAt: {
                        gte: input.date,
                        lte: input.date
                    }
                }
            });
            const feature = await ctx.prisma.featureImportance.findFirst({
                where: {
                    id: input.featureId
                }
            });
            const featureName = feature?.featureName;
            if(!featureName) {
                return []
            }
            const churnGraph = [];
            for (let i = 0; i < usersPredictions.length; i++) {
                const userPrediction = usersPredictions[i]
                if (!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject
                if(userData && userData.hasOwnProperty(featureName)) {
                    churnGraph.push({
                        userDistinctId: userPrediction.userDistinctId,
                        y: userPrediction.probability,
                        x: userData[featureName]
                    })
                }
            }
            return churnGraph;
        }),

    churnByDay: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.date({
                required_error: "Date is required"
            })
        }))    
        .query(async ({ctx, input}) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyChurnByDate;
            }  
            const start_date = new Date(input.date);
            start_date.setDate(start_date.getDate() - 7);
            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                    createdAt: {
                        lte: input.date,
                        gte: start_date,
                    }
                }
            });
            const churnByDate: Churn[] = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(start_date);
                date.setDate(date.getDate() + i);
                const usersPredictionsByDate = usersPredictions.filter((userPrediction) => {
                    return userPrediction.createdAt.getDate() === date.getDate()
                });
                const usersChurned = usersPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.probability < 0.5
                });
                const actualChurn = usersPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.actualResult == 0
                });

                churnByDate.push({
                    date: date.toDateString(),
                    users: usersPredictionsByDate.length,
                    predictedChurn: usersChurned.length,
                    actualChurn: actualChurn.length > 0 ? actualChurn.length : undefined
                })
            }
            return churnByDate;
        }),


    getCohorts: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
        }))
        .query(async ({ctx, input}) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyCohortsData;
            }  
            const cohorts = await ctx.prisma.cohorts.findMany({
                where: {
                    dataModelId: input.modelId, 
                }
            })
            const userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            })
            const cohortsData: Cohort[] = [
            ];
            for(let i = 0; i < cohorts.length; i++) {
                const cohort = cohorts[i];
                if(!cohort) {
                    continue;
                }
                let predictedChurn = 0;
                let actualChurn = 0;
                const userList = [];
                for(let j = 0; j < userPredictions.length; j++) {
                    const userPrediction = userPredictions[j];
                    if (!userPrediction) {
                        continue
                    }
                    const userData = userPrediction.userData as Prisma.JsonObject
                    if(userData && userData.hasOwnProperty(cohort.attributeName)) {
                        if(userData[cohort.attributeName] === cohort.attributeValue) {
                            if(userPrediction.probability < 0.5) {
                                predictedChurn++;
                            }
                            if(userPrediction.actualResult === 0) {
                                actualChurn++;
                            }
                        }
                        userList.push(userPrediction.userData);
                    }
                }
                cohortsData.push({
                    name: cohort.name,
                    predictedChurn: predictedChurn / userList.length,
                    actualChurn: actualChurn / userList.length,
                    deviation: predictedChurn - actualChurn / userList.length,
                    userList: userList.toString()
                });
            }
        })

})