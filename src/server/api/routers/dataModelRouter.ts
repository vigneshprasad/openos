import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type UserPrediction, type Prisma } from "@prisma/client";
import { dummyChurnByDate, dummyChurnGraph, dummyCohortsData, dummyFeatures, dummyModel } from "~/constants/dummyData";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
import { type ExcelCell, type ExcelSheet } from "~/types/types";
import moment from "moment";

export type Cohort = {
    name: string,
    predictedChurn: number,
    actualChurn?: number,
    deviation?: number,
    totalUsers: number,
}

export type Churn = {
    date: string,
    users: number,
    predictedChurn: number,
    actualChurn?: number
}

export const dataModelRouter = createTRPCRouter({
    getModels: protectedProcedure
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
            date: z.string({
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
            // const today = moment(input.date, "DD/MM/YYYY")
            // const tomorrow = moment(today).add(1, 'days')
            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
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
            const features: {[key: string]: {
                total: number,
                probability: number,
            }} = {};
            for (let i = 0; i < usersPredictions.length; i++) {
                const userPrediction = usersPredictions[i]
                if (!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject
                if(userData && userData.hasOwnProperty(featureName)) {
                    const key = userData[featureName] as string
                    if(features.hasOwnProperty(key)) {
                        const oldFeature = features[key];
                        if(oldFeature) {
                            features[key] = {
                                probability: oldFeature.probability + userPrediction.probability,
                                total: oldFeature.total + 1
                            };
                        } else {
                            features[key] = {
                                probability: userPrediction.probability,
                                total: 1
                            };
                        }
                    } else {
                        features[key] = {
                            probability: userPrediction.probability,
                            total: 1
                        };
                    }
                    
                }
            }
            const churnGraph = [];
            for (const key in features) {
                const newKey = key === "" ? "Unknown" : key;
                const feature = features[key];
                if(feature) {
                    churnGraph.push({
                        x: newKey,
                        y: feature.probability / feature.total
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
            date: z.string({
                required_error: "String is required"
            }),
            period: z.string({
                required_error: "Period is required"
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
            const period = input.period === "weekly" ? 7 : 1;
            const date = moment(input.date, "DD/MM/YYYY")
            const start_date = moment(date).subtract(7 * period, 'days').toDate();
            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            });
            const churnByDate: Churn[] = [];
            for (let i = 1; i <= 7 *  period; i = i + period) {
                const date = new Date(start_date);
                date.setDate(date.getDate() + i);
                const userPredictionsByDate: UserPrediction[] = [];

                for(let j = 0; j < period; j++) {
                    const newDate = new Date(date);
                    newDate.setDate(date.getDate() + j);
                    const predictionsByDate = usersPredictions.filter((userPrediction) => {
                        return userPrediction.dateOfEvent.getDate() === newDate.getDate() && userPrediction.dateOfEvent.getMonth() === newDate.getMonth() && userPrediction.dateOfEvent.getFullYear() === newDate.getFullYear()
                    });
                    userPredictionsByDate.push(...predictionsByDate);
                }
                const usersChurned = userPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.probability < 0.5
                });

                const actualChurn = userPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.actualResult == 0
                });

                const actualChurnNull = userPredictionsByDate.filter((userPrediction) => {
                    return userPrediction.actualResult == null
                });

                churnByDate.push({
                    date: date.toDateString(),
                    users: userPredictionsByDate.length,
                    predictedChurn: usersChurned.length / userPredictionsByDate.length,
                    actualChurn: actualChurnNull.length == 0 ? actualChurn.length / userPredictionsByDate.length : undefined
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
                let totalUsers = 0;
                let showActualChurn = true;
                for(let j = 0; j < userPredictions.length; j++) {
                    const userPrediction = userPredictions[j];
                    if (!userPrediction) {
                        continue
                    }
                    const userData = userPrediction.userData as Prisma.JsonObject
                    if(userData && userData.hasOwnProperty(cohort.attributeName)) {
                        if((userData[cohort.attributeName] as unknown as string).includes(cohort.attributeValue)) {
                            if(userPrediction.actualResult == null) {
                                showActualChurn = false;
                            }
                            if(userPrediction.probability < 0.5) {
                                predictedChurn++;
                            }
                            if(userPrediction.actualResult === 0) {
                                actualChurn++;
                            }
                            totalUsers++;
                        }
                    }
                }
                cohortsData.push({
                    name: cohort.name,
                    predictedChurn: (predictedChurn / totalUsers).toFixed(2) as unknown as number,
                    actualChurn: (showActualChurn ? actualChurn / totalUsers : undefined)?.toFixed(2) as unknown as number,
                    deviation: (showActualChurn ? predictedChurn - actualChurn / totalUsers : undefined)?.toFixed(2) as unknown as number,
                    totalUsers: totalUsers,
                });
            }
            return cohortsData;
        }),

    getUserList: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
        }))
        .mutation(async ({ctx, input}) => {
            const userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            });
            const userListSheet: ExcelCell[][] = [];
            const headings: string[] = ['converted_predicted', '0_predicted_proba', '1_predicted_proba'];
            for(let j = 0; j < userPredictions.length; j++) {
                const userPrediction = userPredictions[j];
                if (!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject
                for (const key in userData) {
                    if(!headings.includes(key)) {
                        headings.push(key);
                    }
                }
            }
            const header: ExcelCell[] = [];
            for(const key of headings) { 
                header.push({
                    value: key
                })
            }
            userListSheet.push(header);
            for(let j = 0; j < userPredictions.length; j++) {
                const userPrediction = userPredictions[j];
                if (!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject
                const row:ExcelCell[] = [];
                for(const key of headings) {
                    row.push({
                        value: userData.hasOwnProperty(key) ? (userData[key] as string).replaceAll(",", "") : ""
                    })
                }
                userListSheet.push(row);
            }
            const userList: ExcelSheet = {
                heading: "List of Users",
                sheet: userListSheet
            };
            return userList;
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