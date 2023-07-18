import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { dummyChurnByDate, dummyChurnGraph, dummyCohortsData, dummyFeatures, dummyModel } from "~/constants/dummyData";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";

export type Cohort = {
    name: string,
    predictedChurn: number,
    actualChurn?: number,
    deviation?: number,
    userList: Prisma.JsonObject[],
}

export type Churn = {
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

            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                return ctx.prisma.dataModel.findMany({
                    where: {
                        completionStatus: true
                    }
                });
            }

            return ctx.prisma.dataModel.findMany({
                where: {
                    userId: ctx.session.user.id,
                    completionStatus: true
                }
            });
        }),

    getModelMutation: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                return dummyModel;
            }            

            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                return ctx.prisma.dataModel.findMany();
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
        .mutation(async ({ctx, input}) => {
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
                },
                take: 6,
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
        .mutation(async ({ctx, input}) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return dummyChurnGraph;
            }  
            const tomorrow = new Date();
            tomorrow.setDate(input.date.getDate() + 1);
            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                    dateOfEvent: {
                        gte: new Date(input.date.toDateString()),
                        lt: new Date(tomorrow.toDateString())
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
                        y: userPrediction.probability.toFixed(2) as unknown as number,
                        x: userData[featureName] as string
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
        .mutation(async ({ctx, input}) => {
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
                }
            });
            const churnByDate: Churn[] = [];
            for (let i = 1; i <= 7; i++) {
                const date = new Date(start_date);
                date.setDate(date.getDate() + i);
                const usersPredictionsByDate = usersPredictions.filter((userPrediction) => {
                    return userPrediction.dateOfEvent.getDate() === date.getDate()
                });
                const usersChurned = usersPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.probability < 0.5
                });
                const actualChurn = usersPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.actualResult == 0
                });

                const actualChurnNull = usersPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.actualResult == null
                });

                churnByDate.push({
                    date: date.toDateString(),
                    users: usersPredictionsByDate.length,
                    predictedChurn: (usersChurned.length / usersPredictionsByDate.length).toFixed(2) as unknown as number,
                    actualChurn: actualChurnNull.length == 0 ? (actualChurn.length / usersPredictionsByDate.length).toFixed(2) as unknown as number : undefined
                })
            }
            return churnByDate;
        }),


    getCohorts: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.date({
                required_error: "Date is required"
            }),
        }))
        .mutation(async ({ctx, input}) => {
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
            const tomorrow = new Date(input.date.toDateString());
            tomorrow.setDate(tomorrow.getDate() + 1);
            const userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                    dateOfEvent: {
                        gte: new Date(input.date.toDateString()),
                        lt: new Date(tomorrow.toDateString())
                    }
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
                let showActualChurn = true;
                const userList: Prisma.JsonObject[] = [];
                for(let j = 0; j < userPredictions.length; j++) {
                    const userPrediction = userPredictions[j];
                    if (!userPrediction) {
                        continue
                    }
                    const userData = userPrediction.userData as Prisma.JsonObject
                    if(userData && userData.hasOwnProperty(cohort.attributeName)) {
                        if(userData[cohort.attributeName] === cohort.attributeValue) {
                            userList.push(userData);
                            if(userPrediction.actualResult == null) {
                                showActualChurn = false;
                            }
                            if(userPrediction.probability < 0.5) {
                                predictedChurn++;
                            }
                            if(userPrediction.actualResult === 0) {
                                actualChurn++;
                            }
                        }
                    }
                }
                cohortsData.push({
                    name: cohort.name,
                    predictedChurn: predictedChurn / userList.length,
                    actualChurn: showActualChurn ? actualChurn / userList.length : undefined,
                    deviation: showActualChurn ? predictedChurn - actualChurn / userList.length : undefined,
                    userList: userList
                });
            }
            return cohortsData;
        }),

    create: protectedProcedure
        .input(z.object({ 
            name: z.string({
              required_error: "Name is required"
            }),
            description: z.string({
              required_error: "Description is required"
            }),
            type: z.string({
              required_error: "Type is required"
            }),
            userFilter: z.string(),
            predictionTimeframe: z.string(),
            eventA: z.string({
                required_error: "Event A is required"
            }),
            eventB: z.string({ }),
            eventAFrequency: z.string({}),
            predictionWindow: z.string({}),
            timeInterval: z.string({}),
        }))
        .mutation(async ({ ctx, input }) => {
            const slackMessage = 
                `Data Model Requested.\n
                    Name: ${input.name}\n
                    Description: ${input.description}`
            await sendResourceAddedMessage(slackMessage, ctx.session.user)

            return await ctx.prisma.dataModel.create({
                data: {
                    name: input.name,
                    description: input.description,
                    type: input.type,
                    userFilter: input.userFilter,
                    predictionTimeframe: input.predictionTimeframe,
                    eventA: input.eventA,
                    eventB: input.eventB,
                    eventAFrequency: Number(input.eventAFrequency),
                    predictionWindow: Number(input.predictionWindow),
                    timeInterval: Number(input.timeInterval),
                    userId: ctx.session.user.id,
                    completionStatus: false,
                },
            });
        })

})