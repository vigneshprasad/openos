import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { DATABASE_QUERY, GET_DATA, GET_REPORT } from "~/constants/commandConstants";
import { runQuery } from "~/server/commands/runQuery";
import { TRPCClientError } from "@trpc/client";
import { getRazorpayData } from "~/server/commands/getRazorpayData";
import { getFinancialReport } from "~/server/commands/getFinancialReport";
import { FINANCIAL_REPORT, MIS_B2C } from "~/constants/reportConstants";
import { getMISB2C } from "~/server/commands/getMISB2C";


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
                        try { 
                            return await getFinancialReport(ctx.session.user.id);
                        } catch(e) {
                            console.log(e)
                            throw new TRPCClientError(`Bad Query BRUHUH, ${e as string}`);
                        }
                    case MIS_B2C:
                        try {
                            return await getMISB2C(query, ctx.session.user.id);
                        } catch(e) {
                            throw new TRPCClientError(`Bad Query LOLOL, ${e as string}`);
                        }
                }
                break;

            default:
                throw new TRPCClientError('Bad Query');
        }
    })       
})
