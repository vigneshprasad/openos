import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { DATABASE_QUERY, GET_DATA } from "~/constants/commandConstants";
import { runQuery } from "~/server/commands/runQuery";
import { TRPCClientError } from "@trpc/client";
import { getDateRangeFromString } from "~/utils/getDateRangeFromString";
import { getCustomerFromString } from "~/utils/getCustomerFromStrings";
import { getOrderIdFromString } from "~/utils/getOrderIdFromString";
import { getEntityFromString } from "~/utils/getEntityFromString";


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
                const dateRange = await getDateRangeFromString(query);
                const customer = await getCustomerFromString(query);
                const orderId = getOrderIdFromString(query);
                const entityName = await getEntityFromString(query);
                return {
                    type: GET_DATA,
                    data: [
                        {
                            dateRange,
                            customer,
                            orderId,
                            entityName
                        }, 
                        undefined
                    ]
                };

            default:
                throw new TRPCClientError('Bad Query');
        }
    })       
})
