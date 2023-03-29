import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { DATABASE_QUERY, GET_DATA } from "~/constants/commandConstants";
import { runQuery } from "~/server/commands/runQuery";
import { TRPCClientError } from "@trpc/client";
import { getRazorpayData } from "~/server/commands/getRazorpayData";


export const commandRouter = createTRPCRouter({
  runCommand: protectedProcedure
    .input(z.object({
        query: z.string({
            required_error: "Query is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const command = input.query.split(':')[0];
        const query = input.query.split(':')[1];
        if(!query) {
            throw new TRPCClientError('Bad Query')
        }
        switch(command) {
            case DATABASE_QUERY:
                return await runQuery(query, ctx.session.user.id);
            case GET_DATA:
                return await getRazorpayData(query, ctx.session.user.id);
            // case GET_REPORT:
            //     return await getReport(query, ctx.session.user.id);

            default:
                throw new TRPCClientError('Bad Query');
        }
    })       
})
