import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { DATABASE_QUERY, EXPENSE_CLASSIFIER, FINANCIAL_DATA, CREATE_REPORT, COMPLEX_REPORT_LOADING, UNKNOWN_COMMAND, ASK_ANALYST, GET_HELP } from "~/constants/commandConstants";
import { runQuery } from "~/server/commands/runQuery";
import { TRPCClientError } from "@trpc/client";
import { getRazorpayData } from "~/server/commands/getRazorpayData";
import { getFinancialReport } from "~/server/commands/getFinancialReport";
import { ACTIVE_USERS, FINANCIAL_REPORT, MARKETING_SPEND, MIS_B2C, USER_ACQUISITION, USER_ACTIVATION, USER_RETENTION } from "~/constants/reportConstants";
import { getUserAcquisitionReport } from "~/server/commands/getUserAcquisitionReport";
import { getUserActivationReport } from "~/server/commands/getUserActivationReport";
import { getActiveUserReport } from "~/server/commands/getActiveUserReport";
import { getRetentionReport } from "~/server/commands/getRetentionReport";
import { getMarketingSpendReport } from "~/server/commands/getMarketingSpendReport";
import { getExpenseClassificationTest } from "~/utils/getExpenseClassification";
import { returnCommandResult } from "~/utils/returnCommandResult";
import { type CommandResultType } from "~/types/types";
import { sendHelpMessage } from "~/utils/sendSlackMessage";
import { activeUserData, marketingSpentData, retentionData, userAcquisitionData, userActivationData } from "~/constants/dummyData";
import { Command } from "aws-sdk/clients/sms";

export const commandRouter = createTRPCRouter({
  runCommand: protectedProcedure
    .input(z.object({
        query: z.string({
            required_error: "Query is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const command = input.query.split(':')[0]?.trim().toLowerCase();
        const query = input.query.split(':')[1]?.trim().toLowerCase();

        const user = await ctx.prisma.user.findUnique({
            where: {
                id: ctx.session.user.id,
            }
        });

        if(!query || !command) {
            return returnCommandResult(
                UNKNOWN_COMMAND,
                input.query,
                [
                    undefined,
                    {
                        message: 'Bad Command',
                        cause: 'Invalid Command',
                        query: 'Unable to process',
                    }
                ],
                ctx.session.user.id,
            )
        }
        let result: CommandResultType;
        switch(command) {
            case DATABASE_QUERY:
                result = await runQuery(query, ctx.session.user.id) as CommandResultType;
                return await returnCommandResult(
                    command,
                    input.query,
                    result,
                    ctx.session.user.id,
                )
            case FINANCIAL_DATA:
                result = await getRazorpayData(query, ctx.session.user.id) as CommandResultType;
                return await returnCommandResult(
                    command,
                    input.query,
                    result,
                    ctx.session.user.id,
                )
            case CREATE_REPORT:
                switch(query) {
                    case FINANCIAL_REPORT:
                        result = await getFinancialReport(ctx.session.user.id) as CommandResultType;
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )
                    case MIS_B2C:
                        return await returnCommandResult(
                            COMPLEX_REPORT_LOADING,
                            input.query,
                            [[
                                `${CREATE_REPORT}: ${USER_ACQUISITION}`,
                                `${CREATE_REPORT}: ${USER_ACTIVATION}`,
                                `${CREATE_REPORT}: ${ACTIVE_USERS}`,
                                `${CREATE_REPORT}: ${USER_RETENTION}`,
                                `${CREATE_REPORT}: ${MARKETING_SPEND}`,
                            ], undefined],
                            ctx.session.user.id,
                        )
                    case USER_ACQUISITION:
                        if(user?.isDummy) {
                            return returnCommandResult(
                                command,
                                input.query,
                                userAcquisitionData as CommandResultType,
                                ctx.session.user.id,
                            )
                        }
                        result = await getUserAcquisitionReport(query, ctx.session.user.id) as CommandResultType; 
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )
                    case USER_ACTIVATION:
                        if(user?.isDummy) {
                            return returnCommandResult(
                                command,
                                input.query,
                                userActivationData as CommandResultType,
                                ctx.session.user.id,
                            )
                        }
                        result =  await getUserActivationReport(query, ctx.session.user.id) as CommandResultType;
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )
                    case ACTIVE_USERS:
                        if(user?.isDummy) {
                            return returnCommandResult(
                                command,
                                input.query,
                                activeUserData as CommandResultType,
                                ctx.session.user.id,
                            )
                        }
                        result = await getActiveUserReport(query, ctx.session.user.id) as CommandResultType;
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )
                    case USER_RETENTION:
                        if(user?.isDummy) {
                            return returnCommandResult(
                                command,
                                input.query,
                                retentionData as CommandResultType,
                                ctx.session.user.id,
                            )
                        }
                        result = await getRetentionReport(query, ctx.session.user.id) as CommandResultType;
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )

                    case MARKETING_SPEND:
                        if(user?.isDummy) {
                            return returnCommandResult(
                                command,
                                input.query,
                                marketingSpentData as CommandResultType,
                                ctx.session.user.id,
                            )
                        }
                        result = await getMarketingSpendReport(query, ctx.session.user.id) as CommandResultType;
                        return await returnCommandResult(
                            command,
                            input.query,
                            result,
                            ctx.session.user.id,
                        )
                    default:
                        return {
                            type: UNKNOWN_COMMAND,
                            input: input.query,
                            output: [
                                [
                                    undefined,
                                    {
                                        text: 'Bad Command',
                                        cause: 'Invalid Command',
                                        query: 'Unable to process',
                                    }
                                ]
                            ]
                        }
                }

            case ASK_ANALYST:
            case GET_HELP:
                const message = await sendHelpMessage(
                    input.query,
                    ctx.session.user,
                )
                return {
                    type: GET_HELP,
                    input: input.query,
                    output: [
                        message
                    ]
                }

            default:
                return {
                    type: UNKNOWN_COMMAND,
                    input: input.query,
                    output: [
                        [
                            undefined,
                            {
                                text: 'Bad Command',
                                cause: 'Invalid Command',
                                query: 'Unable to process',
                            }
                        ]
                    ]
                }
        }
    }),   
    
  runWithoutCreatingHistory: protectedProcedure
    .input(z.object({
        query: z.string({
            required_error: "Query is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const command = input.query.split(':')[0]?.trim().toLowerCase();
        const query = input.query.split(':')[1]?.trim().toLowerCase();
        if(!query) {
            throw new TRPCClientError('Bad Query')
        }
        switch(command) {
            case DATABASE_QUERY:
                return await runQuery(query, ctx.session.user.id);
            case FINANCIAL_DATA:
                return await getRazorpayData(query, ctx.session.user.id);
            case CREATE_REPORT:
                switch(query) {                     
                    case USER_ACQUISITION:
                        return await getUserAcquisitionReport(query, ctx.session.user.id);
                    case USER_ACTIVATION:
                        return await getUserActivationReport(query, ctx.session.user.id);
                    case ACTIVE_USERS:
                        return await getActiveUserReport(query, ctx.session.user.id);
                    case USER_RETENTION:
                        return await getRetentionReport(query, ctx.session.user.id);
                    case MARKETING_SPEND:
                        return await getMarketingSpendReport(query, ctx.session.user.id);
                }
                break;
            case EXPENSE_CLASSIFIER: 
                return await getExpenseClassificationTest();
            default:
                throw new TRPCClientError('Bad Query');
        }
    })    
})
