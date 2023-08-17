import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
import { type GraphData } from "./dataModelRouter";
import axios from "axios";
import { GA_FORECAST_API_URL, GA_AGGREGATE_API_URL } from "~/constants/prophetConstants";
import { TRPCError } from "@trpc/server";
import { type GATimePeriodOption, type GADimension, type GAForecastModel, GAInsights, GAForecastModelType } from "@prisma/client";
import moment from "moment";

export type ForecastResults = {
    timeSeries: string[],
    series: [
        {
            name: string,
            data: number[]
        }
    ]
}

export type ForecastModelResults = {
    model: GAForecastModel,
    dimensions: GADimension[],
    metrics: GADimension[],
    timePeriod: GATimePeriodOption[]
}

export type ForecastByDimension = {
    name: string,
    aggregate: number,
    predicted: number,
}

export type AggregatedForecastByDimension = {
    cohort1: ForecastByDimension[],
    cohort2?: ForecastByDimension[],
}
  
export const gaForecastRouter = createTRPCRouter({

    getForecastModels: protectedProcedure
        .input(z.object({ 
            type: z.string({
                required_error: "Metric is required"
            }),
        }))
        .mutation(async ({ ctx, input }):Promise<ForecastModelResults> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                // TODO
            }

            const type = input.type as GAForecastModelType;

            let model;
            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                model = await ctx.prisma.gAForecastModel.findFirst({
                    where: {
                        type: type,
                    },
                    include: {
                        gaDimension: true,
                        gaMetric: true,
                        gaTimePeriodOption: true
                    }
                });
            } else {
                model = await ctx.prisma.gAForecastModel.findFirst({
                    where: {
                        userId: ctx.session.user.id,
                        type: type,
                    },
                    include: {
                        gaDimension: true,
                        gaMetric: true,
                        gaTimePeriodOption: true
                    }
                });
            }
            
            if(!model) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No data found"
                })
            }
            const results:ForecastModelResults = {
                model: model,
                dimensions: model.gaDimension,
                metrics: model.gaMetric,
                timePeriod: model.gaTimePeriodOption,
            };

            return results;
        }),

    getGraphData: protectedProcedure
        .input(z.object({ 
            metric: z.string({
                required_error: "Metric is required"
            }),
            dimension: z.string({
                required_error: "Dimension is required"
            }),
            timePeriod: z.string({
                required_error: "Time period is required"
            }),
            startDate: z.string({
                required_error: "Start date is required"
            }),
        }))
        .mutation( async ({ ctx, input }):Promise<GraphData> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                // TODO
            }
            
            let gaObject;
            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                gaObject = await ctx.prisma.googleAnalytics.findFirst({
                    orderBy: [{
                        updatedAt: "desc"
                    }]
                });  
            } else {    
                gaObject = await ctx.prisma.googleAnalytics.findFirst({
                    where: {
                        userId: ctx.session.user.id
                    }
                });  
            }

            const startDate = moment(input.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            
            const response = await axios.post(GA_FORECAST_API_URL, {
                metric: input.metric,
                dimension: input.dimension, 
                time_period: input.timePeriod,
                object_id: gaObject?.id,
                start_date: startDate
            });

            if(response.data) {
                const json = response.data as ForecastResults;
                const result:GraphData = {
                    xAxis: json.timeSeries.map(
                        (date) => moment(date, "YYYY-MM-DD").toDate()),
                    title: "Sales Forecast",
                    data: json.series
                }
                return result;
            } else {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No data found"
                })
            }
        }),

    getAggregatedForecastByDimension: protectedProcedure
        .input(z.object({ 
            timePeriod: z.string({
                required_error: "Time period is required"
            }),
            startDate: z.string({
                required_error: "Start date is required"
            }),
        }))
        .mutation( async ({ ctx, input }):Promise<AggregatedForecastByDimension> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                // TODO
            }

            let gaObject;
            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                gaObject = await ctx.prisma.googleAnalytics.findFirst({
                    orderBy: [{
                        updatedAt: "desc"
                    }]
                });  
            } else {    
                gaObject = await ctx.prisma.googleAnalytics.findFirst({
                    where: {
                        userId: ctx.session.user.id
                    }
                });  
            }


            let gAForecastModel;
            if(user?.email === "vignesh@openos.tools" || user?.email === "vivan@openos.tools" || user?.email === "vivanpuri22@gmail.com") {
                gAForecastModel = await ctx.prisma.gAForecastModel.findFirst({
                });
            } else {
                gAForecastModel = await ctx.prisma.gAForecastModel.findFirst({
                    where: {
                        userId: ctx.session.user.id,
                    },
                });
            }
            
            const gaModelPrimaryCohorts = await ctx.prisma.gAModelPrimaryCohorts.findFirst({
                where: {
                    dataModelId: gAForecastModel?.id
                }
            });

            if(!gaModelPrimaryCohorts) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No data found"
                })
            }


            const startDate = moment(input.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            
            const response = await axios.post(GA_AGGREGATE_API_URL, {
                dimension: gaModelPrimaryCohorts?.predictionCohort1, 
                metric: 'conversions',
                time_period: input.timePeriod,
                object_id: gaObject?.id,
                start_date: startDate
            });

            if(response.data) {
                const json = response.data as ForecastByDimension[];
                const result:AggregatedForecastByDimension = {
                    cohort1: json,
                }
                return result;
            } else {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No data found"
                })
            }
        }),

    getGaFeatures: protectedProcedure
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
                //TODO;
            }  
            return ctx.prisma.gAFeatureImportance.findMany({
                where: {
                    dataModelId: input.modelId, 
                },
                orderBy: {
                    importance: "desc"
                },
                take: 6,
            })
        }),

    getGaInsights: protectedProcedure
        .input(z.object({
            modelId: z.string({
                required_error: "Model Id is required"
            })  
        }))
        .mutation(async ({ ctx, input }): Promise<GAInsights[]> => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                }
            });

            if(user?.isDummy) {
                // return dummyInsights;
            }            

            return ctx.prisma.gAInsights.findMany({
                where: {
                    modelId: input.modelId
                }
            });
        }),
});
  