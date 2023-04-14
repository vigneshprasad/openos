import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { COMPLEX_REPORT, DATABASE_QUERY, EXPENSE_CLASSIFIER, GET_DATA, GET_REPORT } from "~/constants/commandConstants";
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

export const commandRouter = createTRPCRouter({
  runCommand: protectedProcedure
    .input(z.object({
        query: z.string({
            required_error: "Query is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const command = input.query.split(':')[0]?.trim();
        const query = input.query.split(':')[1]?.trim();
        if(!query) {
            throw new TRPCClientError('Bad Query')
        }
        switch(command) {
            case DATABASE_QUERY:
                return await runQuery(query, ctx.session.user.id);
            case GET_DATA:
                return await getRazorpayData(query, ctx.session.user.id);
            case GET_REPORT:
                switch(query) {
                    case FINANCIAL_REPORT:
                        return await getFinancialReport(ctx.session.user.id);                        
                    case MIS_B2C:
                        return {
                            type: COMPLEX_REPORT,
                            data: [
                                [
                                    `${GET_REPORT}: ${USER_ACQUISITION}`,
                                    `${GET_REPORT}: ${USER_ACTIVATION}`,
                                    `${GET_REPORT}: ${ACTIVE_USERS}`,
                                    `${GET_REPORT}: ${USER_RETENTION}`,
                                    `${GET_REPORT}: ${MARKETING_SPEND}`,
                                ],
                                undefined
                            ]
                        }
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
