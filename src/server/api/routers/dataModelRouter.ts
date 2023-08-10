import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma, type DataModel } from "@prisma/client";
import { dummyFeatures, dummyModel } from "~/constants/dummyData";
import { sendResourceAddedMessage } from "~/utils/sendSlackMessage";
import { type ExcelCell, type ExcelSheet } from "~/types/types";
import moment from "moment";
import { getDummyIncludeAndExclude, getDummyScatterPlot, getDummyChurnCards, getDummyModelGraph, getDummyAggregateChurnByPrimaryCohorts } from "~/constants/fakerFunctions";

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

export type GraphDataSeries = {
    name: string,
    data: (number | null)[],
}

export type GraphData = {
    xAxis: Date[],
    title: string,
    data: GraphDataSeries[],
}

export type ModelGraph = {
    cohort1: GraphData,
    cohort2: GraphData,
}

export type ChurnCards = {
    totalUsers: number,
    totalUsersDeviation: number,
    predictedChurn: number,
    predictedChurnDeviation: number,
    actualChurn: number | null,
    actualChurnDeviation: number | null,
}

export type AggregateChurn = {
    title: string,
    totalUsers: number,
    predictedChurnUsers: number,
}

export type AggregateChurnByPrimaryCohorts = {
    cohort1: {
        title: string,
        data: AggregateChurn[]
    },
    cohort2: {
        title: string,
        data: AggregateChurn[]
    }
}

export type LookAlikeUsers = {
    distinctId: string,
    probability: number,
}

export type IncludeAndExcludeUsers = {
    include: {
        users: LookAlikeUsers[]
        userList: ExcelSheet
    },
    exclude: {
        users: LookAlikeUsers[]
        userList: ExcelSheet
    }
}

export type ScatterPlotData = {
    series: {
        x: number | string,
        y: number,
    }[]
}

export type DataModelList = {
    model: DataModel,
    start_date: Date,
    end_date: Date,
}

export const dataModelRouter = createTRPCRouter({
    getModels: protectedProcedure
        .mutation(async ({ ctx }):Promise<DataModelList[]> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                return dummyModel;
            }            

            let models = []
            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                models = await ctx.prisma.dataModel.findMany({});
            } else {
                models = await ctx.prisma.dataModel.findMany({
                    where: {
                        userId: ctx.session.user.id,
                    }
                });
            }

            const results:DataModelList[] = [];

            for(let i = 0; i < models.length; i++) {
                const model = models[i]
                const modelId = models[0]?.id;
                const start_date = models[i]?.createdAt;
                if(!model || !start_date || !modelId) continue;
                const userPredictions = await ctx.prisma.userPrediction.findFirst({
                    where: {
                        dataModelId: modelId
                    },
                    orderBy: {
                       dateOfEvent: "desc"
                    }
                });
                if(!userPredictions) continue;
                results.push({
                    model: model,
                    start_date: start_date,
                    end_date: userPredictions.dateOfEvent
                })   
            }

            return results;
        }),

    getModelMutation: protectedProcedure
        .mutation(async ({ ctx }):Promise<DataModel[]> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });        

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

        
    getUserList: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.string({
                required_error: "String is required"
            }),
            endDate: z.string({
                required_error: "End date is required"
            }),
        }))
        .mutation(async ({ctx, input}) => {
            
            const date = moment(input.date, "DD/MM/YYYY")
            const end = moment(input.endDate, "DD/MM/YYYY")

            // Get all the user predictions for the model in the relevant time period
            const userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                    dateOfEvent: {
                        gte: date.toISOString(),
                        lt: end.toISOString(),
                    }
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
        }),
    
    modelPrimaryGraph: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.string({
                required_error: "String is required"
            }),
            endDate: z.string({
                required_error: "End date is required"
            }),
        }))    
        .mutation(async ({ctx, input}) : Promise<ModelGraph> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return getDummyModelGraph(input.date, input.modelId, input.endDate);
            }  

            // Get time series based on whether the data is weekly or hourly
            const timeSeries: Date[] = []
            const startDate = moment(input.date, "DD/MM/YYYY")
            const endDate = moment(input.endDate, "DD/MM/YYYY")
            if(input.date !== input.endDate) {
                const date = moment(input.date, "DD/MM/YYYY")
                const end_date = moment(input.endDate, "DD/MM/YYYY")
                while(date.isSameOrBefore(end_date, 'days')) {
                    timeSeries.push(date.toDate());
                    date.add(1, 'days');
                }
            } else {
                const date = moment(input.date, "DD/MM/YYYY")
                for(let i = 1; i <= 6; i++) {
                    const new_date = moment(date).add((i*4), 'hours').toDate();
                    timeSeries.push(new_date);
                }
            }

            // Get all the user predictions for the model in the relevant time period
            let usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            });

            usersPredictions = usersPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(startDate, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore(endDate, 'days');
            });
            
            // Get the primary graph parameters for the model
            const dataModelPrimaryGraph = await ctx.prisma.dataModelPrimaryGraph.findFirst({
                where: {
                    dataModelId: input.modelId,
                }
            });

            if(!dataModelPrimaryGraph) {
                return {
                    cohort1: {
                        xAxis: timeSeries.slice(0, timeSeries.length),
                        title: '',
                        data: []
                    },
                    cohort2: {
                        xAxis: timeSeries.slice(0, timeSeries.length),
                        title: '',
                        data: []
                    }
                }
            }

            const predictionCohort1 = dataModelPrimaryGraph?.predictionCohort1;
            const predictionCohort2 = dataModelPrimaryGraph?.predictionCohort2;

            // Get the frequency of each cohort for each time period
            const predictionCohort1Frequency: {[key: string]: {
                count: number,
            }} = {};
            const predictionCohort2Frequency: {[key: string]: {
                count: number,
            }} = {};
            
            for(let i = 0; i < usersPredictions.length; i++) {
                const userPrediction = usersPredictions[i];
                if(!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject

                if(userData.hasOwnProperty(predictionCohort1)) {
                    const value = userData[predictionCohort1] as string;
                    const count = predictionCohort1Frequency[value]?.count;
                    predictionCohort1Frequency[value] = {
                        count: count ? count + 1 : 1
                    };
                }

                if(userData.hasOwnProperty(predictionCohort2)) {
                    const value = userData[predictionCohort2] as string;
                    const count = predictionCohort2Frequency[value]?.count;
                    predictionCohort2Frequency[value] = {
                        count: count ? count + 1 : 1
                    };
                }
                
            }

            // Sort the frequency arrays in descending order
            const predictionCohort1FrequencyArray = Object.keys(predictionCohort1Frequency);
            const predictionCohort2FrequencyArray = Object.keys(predictionCohort2Frequency);
            predictionCohort1FrequencyArray.sort((a, b) => {
                const aValue = (predictionCohort1Frequency[a] && predictionCohort1Frequency[a]?.count) ? predictionCohort1Frequency[a]?.count : 0;
                const bValue = (predictionCohort1Frequency[b] && predictionCohort1Frequency[b]?.count) ? predictionCohort1Frequency[b]?.count : 0;
                if(bValue && aValue)
                    return bValue - aValue;
                else
                    return 0;
            });
            predictionCohort2FrequencyArray.sort((a, b) => {
                const aValue = predictionCohort2Frequency[a] && predictionCohort2Frequency[a]?.count ? predictionCohort2Frequency[a]?.count : 0;
                const bValue = predictionCohort2Frequency[b] && predictionCohort2Frequency[b]?.count ? predictionCohort2Frequency[b]?.count : 0;
                if(bValue && aValue)
                    return bValue - aValue;
                else
                    return 0;
            });

            const resultData: ModelGraph = {
                cohort1: {
                    xAxis: timeSeries.slice(0, timeSeries.length),
                    title: predictionCohort1,
                    data: []
                },
                cohort2: {
                    xAxis: timeSeries.slice(0, timeSeries.length),
                    title: predictionCohort2,
                    data: []
                }
            }

            // For the top 5 cohorts, get the number of users in each cohort for each time period
            for (let j = 0; j < predictionCohort1FrequencyArray.length; j++) {
                const cohortValue = predictionCohort1FrequencyArray[j];
                if (j > 4) break;
                const cohortDataSeries: GraphDataSeries = {
                    name: cohortValue ? cohortValue : "Unknown",
                    data: []
                }
                for(let i = 0; i < timeSeries.length; i++) {
                    const start = timeSeries[i];
                    const startMoment = moment(start, 'DD/MM/YYYY');
                    const relevantUsers = usersPredictions.filter((userPrediction) => {
                        return moment(userPrediction.dateOfEvent).isSame(startMoment, 'days')
                    });
                    let count = 0;
                    let total = 0;
                    for (let k = 0; k < relevantUsers.length; k++) {
                        const userPrediction = relevantUsers[k];
                        if(!userPrediction) {
                            continue
                        }
                        const userData = userPrediction.userData as Prisma.JsonObject
                        if (userData[predictionCohort1] === cohortValue) {
                            total++;
                            if (userPrediction.probability > 0.5) {
                                count++;
                            }
                        }
                    } 
                    const percentage = count / total;
                    cohortDataSeries.data.push(total == 0 ? 0 : percentage);
                }

                resultData.cohort1.data.push(cohortDataSeries);
            }


            for (let j = 0; j < predictionCohort2FrequencyArray.length; j++) {
                const cohortValue = predictionCohort2FrequencyArray[j];
                if (j > 4) break;
                const cohortDataSeries: GraphDataSeries = {
                    name: cohortValue ? cohortValue : "Unknown",
                    data: []
                }
                for(let i = 0; i < timeSeries.length; i++) {
                    const start = timeSeries[i];
                    const startMoment = moment(start, 'DD/MM/YYYY');
                    const relevantUsers = usersPredictions.filter((userPrediction) => {
                        return moment(userPrediction.dateOfEvent).isSame(startMoment, 'days')
                    });
                    let count = 0;
                    let total = 0;
                    for (let k = 0; k < relevantUsers.length; k++) {
                        const userPrediction = relevantUsers[k];
                        if(!userPrediction) {
                            continue
                        }
                        const userData = userPrediction.userData as Prisma.JsonObject
                        if (userData[predictionCohort1] === cohortValue) {
                            total++;
                            if (userPrediction.probability > 0.5) {
                                count++;
                            }
                        }
                    } 
                    const percentage = count / total;
                    cohortDataSeries.data.push(total == 0 ? 0 : percentage);
                }
                resultData.cohort2.data.push(cohortDataSeries);
            }

            return resultData;
        }),

    getChurnCards: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.string({
                required_error: "String is required"
            }),
            endDate: z.string({
                required_error: "EndDate is required"
            })
        }))    
        .mutation(async ({ctx, input}) : Promise<ChurnCards> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return getDummyChurnCards(input.date, input.modelId, input.endDate);
            }  
    
            const date = moment(input.date, "DD/MM/YYYY")
            const end_date = moment(input.endDate, "DD/MM/YYYY")
            const period = end_date.diff(date, 'days');
            let previous_start_date = moment(date).subtract(period, 'days');
            let previous_end_date = moment(date).subtract(1, 'days');
                
            if (date.isSame(end_date)) {
                previous_start_date = moment(date).subtract(1, 'days');
                previous_end_date = moment(date).subtract(1, 'days');
            }


            const usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            });


            const churnResults:ChurnCards = {
                totalUsers: 0,
                totalUsersDeviation: 0,
                predictedChurn: 0,
                predictedChurnDeviation: 0,
                actualChurn: 0,
                actualChurnDeviation: 0
            }

            const previousPeriodUsers = usersPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(previous_start_date, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore( previous_end_date, 'days');
            });

            const currentPeriodUsers = usersPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(date, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore(end_date, 'days');
            });

            churnResults.totalUsers = currentPeriodUsers.length;
            churnResults.totalUsersDeviation = (currentPeriodUsers.length - previousPeriodUsers.length) / previousPeriodUsers.length * 100;

            const previousPeriodPredictedChurn = previousPeriodUsers.filter((userPrediction) => {
                return userPrediction.probability > 0.5
            });
            const currentPeriodPredictedChurn = currentPeriodUsers.filter((userPrediction) => {
                return userPrediction.probability > 0.5
            });

            const predictedChurnValue = currentPeriodPredictedChurn.length / currentPeriodUsers.length * 100;
            const previousPeriodPredictedChurnValue = previousPeriodPredictedChurn.length / previousPeriodUsers.length * 100;
            churnResults.predictedChurn = predictedChurnValue;
            churnResults.predictedChurnDeviation = (predictedChurnValue - previousPeriodPredictedChurnValue) / previousPeriodPredictedChurnValue * 100;
            
            const previousPeriodActualChurn = previousPeriodUsers.filter((userPrediction) => {
                return userPrediction.actualResult === 1
            });
            const previousPeriodNotNullValue = previousPeriodUsers.filter((userPrediction) => {
                return userPrediction.actualResult !== null
            });
            const currentPeriodActualChurn = currentPeriodUsers.filter((userPrediction) => {
                return userPrediction.actualResult === 1
            });
            const currentPeriodNotNullValue = currentPeriodUsers.filter((userPrediction) => {
                return userPrediction.actualResult !== null
            });

            const actualChurnValue = currentPeriodNotNullValue.length ? currentPeriodActualChurn.length / currentPeriodNotNullValue.length * 100 : null;
            const previousPeriodActualChurnValue = previousPeriodNotNullValue ? previousPeriodActualChurn.length / previousPeriodNotNullValue.length * 100 : null;
            churnResults.actualChurn = actualChurnValue;
            churnResults.actualChurnDeviation = actualChurnValue && previousPeriodActualChurnValue ? (actualChurnValue - previousPeriodActualChurnValue) / previousPeriodActualChurnValue * 100 : null;

            return churnResults;

        }),

    getAggregateChurnByPrimaryCohorts: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.string({
                required_error: "String is required"
            }),
            endDate: z.string({
                required_error: "End Date is required"
            })
        }))    
        .mutation(async ({ctx, input}) : Promise<AggregateChurnByPrimaryCohorts> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return getDummyAggregateChurnByPrimaryCohorts(input.date, input.modelId, input.endDate);
            }  

            const date = moment(input.date, "DD/MM/YYYY");
            const end = moment(input.endDate, "DD/MM/YYYY");

            // Get all the user predictions for the model in the relevant time period
            let usersPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }
            });

            usersPredictions = usersPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(date, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore(end, 'days');
            });

            // Get the primary graph parameters for the model
            const dataModelPrimaryGraph = await ctx.prisma.dataModelPrimaryGraph.findFirst({
                where: {
                    dataModelId: input.modelId,
                }
            });

            if(!dataModelPrimaryGraph) {
                return {
                    cohort1: {
                        title: '',
                        data: []
                    },
                    cohort2: {
                        title: '',
                        data: []
                    }
                }
            }

            const predictionCohort1 = dataModelPrimaryGraph?.predictionCohort1;
            const predictionCohort2 = dataModelPrimaryGraph?.predictionCohort2;

            // Get the frequency of each cohort to sort them
            const predictionCohort1Frequency: {[key: string]: {
                count: number,
                predicted: number,
            }} = {};
            const predictionCohort2Frequency: {[key: string]: {
                count: number,
                predicted: number,
            }} = {};
            
            for(let i = 0; i < usersPredictions.length; i++) {
                const userPrediction = usersPredictions[i];
                if(!userPrediction) {
                    continue
                }
                const userData = userPrediction.userData as Prisma.JsonObject

                if(userData.hasOwnProperty(predictionCohort1)) {
                    const value = userData[predictionCohort1] as string;
                    const count = predictionCohort1Frequency[value]?.count;
                    const predicted = predictionCohort1Frequency[value]?.predicted;
                    let newPrediction = predicted ? predicted : 0;
                    if(userPrediction.probability > 0.5) {
                        newPrediction = newPrediction + 1;
                    }
                    predictionCohort1Frequency[value] = {
                        count: count ? count + 1 : 1,
                        predicted: newPrediction
                    };

                }

                if(userData.hasOwnProperty(predictionCohort2)) {
                    const value = userData[predictionCohort2] as string;
                    const count = predictionCohort2Frequency[value]?.count;
                    const predicted = predictionCohort2Frequency[value]?.predicted;
                    let newPrediction = predicted !== undefined ? predicted : 0;
                    if(userPrediction.probability > 0.5) {
                        newPrediction = newPrediction + 1;
                    }
                    predictionCohort2Frequency[value] = {
                        count: count ? count + 1 : 1,
                        predicted: newPrediction
                    };
                }
                
            }

            // Sort the frequency arrays in descending order
            const predictionCohort1FrequencyArray = Object.keys(predictionCohort1Frequency);
            const predictionCohort2FrequencyArray = Object.keys(predictionCohort2Frequency);
            predictionCohort1FrequencyArray.sort((a, b) => {
                const aValue = (predictionCohort1Frequency[a] && predictionCohort1Frequency[a]?.count) ? predictionCohort1Frequency[a]?.count : 0;
                const bValue = (predictionCohort1Frequency[b] && predictionCohort1Frequency[b]?.count) ? predictionCohort1Frequency[b]?.count : 0;
                if(bValue && aValue)
                    return bValue - aValue;
                else
                    return 0;
            });
            predictionCohort2FrequencyArray.sort((a, b) => {
                const aValue = predictionCohort2Frequency[a] && predictionCohort2Frequency[a]?.count ? predictionCohort2Frequency[a]?.count : 0;
                const bValue = predictionCohort2Frequency[b] && predictionCohort2Frequency[b]?.count ? predictionCohort2Frequency[b]?.count : 0;
                if(bValue && aValue)
                    return bValue - aValue;
                else
                    return 0;
            });
            
            const resultData: AggregateChurnByPrimaryCohorts = {
                cohort1: {
                    title: predictionCohort1,
                    data: []
                },
                cohort2: {
                    title: predictionCohort2,
                    data: []
                }
            }

            // For the top 10 cohorts, get the number of users in each cohort for each time period
            for (let j = 0; j < predictionCohort1FrequencyArray.length; j++) {
                const cohortValue = predictionCohort1FrequencyArray[j];
                if (j > 9) break;
                if (cohortValue === undefined) continue;
                const frequencyDictionary = predictionCohort1Frequency[cohortValue];
                const predictedChurnUser = frequencyDictionary?.predicted ? frequencyDictionary?.predicted : 0;
                const totalUsers = frequencyDictionary?.count ? frequencyDictionary?.count : 0;

                const cohortDataSeries: AggregateChurn = {
                    title: cohortValue ? cohortValue : "Unknown",
                    totalUsers: totalUsers,
                    predictedChurnUsers: predictedChurnUser / totalUsers * 100,

                }
                resultData.cohort1.data.push(cohortDataSeries);
            }

            for (let j = 0; j < predictionCohort2FrequencyArray.length; j++) {
                const cohortValue = predictionCohort2FrequencyArray[j];
                if (j > 9) break;
                if (cohortValue === undefined) continue;
                const frequencyDictionary = predictionCohort2Frequency[cohortValue];
                const predictedChurnUser = frequencyDictionary?.predicted ? frequencyDictionary?.predicted : 0;
                const totalUsers = frequencyDictionary?.count ? frequencyDictionary?.count : 0;

                const cohortDataSeries: AggregateChurn = {
                    title: cohortValue ? cohortValue : "Unknown",
                    totalUsers: totalUsers,
                    predictedChurnUsers: predictedChurnUser / totalUsers * 100,

                }
                resultData.cohort2.data.push(cohortDataSeries);
            }

            return resultData;
        }),


    getUsersToIncludeAndExclude: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            date: z.string({
                required_error: "String is required"
            }),
            endDate: z.string({
                required_error: "End Date is required"
            })
        }))
        .mutation(async ({ctx, input}) : Promise<IncludeAndExcludeUsers> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
                return getDummyIncludeAndExclude(input.modelId, input.date, input.endDate);
            }

            const date = moment(input.date, "DD/MM/YYYY")
            const end = moment(input.endDate, "DD/MM/YYYY")

            // Get all the user predictions for the model in the relevant time period
            let userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                }, 
                orderBy: [
                    {
                      probability: 'asc',
                    },
                ],
            });

            userPredictions = userPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(date, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore(end, 'days');
            });

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


            const includeUserListSheet: ExcelCell[][] = [];
            const excludeUserListSheet: ExcelCell[][] = [];

            const includeUsers: LookAlikeUsers[] = [];
            const excludeUsers: LookAlikeUsers[] = [];

            
            includeUserListSheet.push(header);
            excludeUserListSheet.push(header);

            const threshold = Math.ceil(userPredictions.length / 10);

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

                if (j < 5) {
                    includeUsers.push({
                        distinctId: userPrediction.userDistinctId,
                        probability: userPrediction.probability
                    })
                }

                if(userPredictions.length - j <= 5) {
                    excludeUsers.push({
                        distinctId: userPrediction.userDistinctId,
                        probability: userPrediction.probability
                    })
                }

                if(j < threshold) {
                    includeUserListSheet.push(row);
                } 
                if(userPredictions.length - j <= threshold) {
                    excludeUserListSheet.push(row);
                }
            }
            
            return {
                include: {
                    users: includeUsers,
                    userList: {
                        heading: 'Include Users',
                        sheet: includeUserListSheet
                    }
                },
                exclude: {
                    users: excludeUsers.reverse(),
                    userList: {
                        heading: 'Exclude Users',
                        sheet: excludeUserListSheet
                    }
                }
            }
        }),


    getScatterPlot: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model ID is required"
            }),
            featureId: z.string({
                required_error: "Feature ID is required"
            }),
            date: z.string({
                required_error: "Date is required"
            }),
            endDate: z.string({
                required_error: "End Date is required"
            })
        }))    
        .mutation(async ({ctx, input}): Promise<ScatterPlotData> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });
            if(user?.isDummy) {
               return getDummyScatterPlot(input.modelId, input.date, input.endDate, input.featureId);
            }  
            const date = moment(input.date, "DD/MM/YYYY")
            const end = moment(input.endDate, "DD/MM/YYYY")

            // Get all the user predictions for the model in the relevant time period
            let userPredictions = await ctx.prisma.userPrediction.findMany({
                where: {
                    dataModelId: input.modelId,
                },
            });

            userPredictions = userPredictions.filter((userPrediction) => {
                return moment(userPrediction.dateOfEvent).isSameOrAfter(date, 'days') && moment(userPrediction.dateOfEvent).isSameOrBefore(end, 'days');
            });

            const feature = await ctx.prisma.featureImportance.findUnique({
                where: {
                    id: input.featureId
                }
            });

            const featureName = feature?.featureName;
            if(!featureName) {
                return {
                    series: []
                }
            }
            const features: {[key: string]: {
                total: number,
                probability: number,
            }} = {};
            for (let i = 0; i < userPredictions.length; i++) {
                const userPrediction = userPredictions[i]
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
            return {
                series: churnGraph
            };
        }),
        
})