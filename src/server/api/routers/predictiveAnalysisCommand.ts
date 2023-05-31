import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { returnCommandResult } from "~/utils/returnCommandResult";
import { type CommandResultType } from "~/types/types";
import { MODEL_CORRELATION, PREDICT_CHURN, PREDICT_LIKELIHOOD, PREDICT_LTV, UNKNOWN_COMMAND } from "~/constants/commandConstants";
import { getLTVPrediction } from "~/server/predictiveAnalysisCommands/getLTVPrediction";
import { getChurnPrediction } from "~/server/predictiveAnalysisCommands/getChurnPrediction";
import { getLikelihoodEvent } from "~/server/predictiveAnalysisCommands/getLikelihoodEvent";
import { getModelCorrelation } from "~/server/predictiveAnalysisCommands/getModelCorrelation";

export const predictiveAnalysisCommandRouter = createTRPCRouter({
  runCommand: protectedProcedure
    .input(z.object({
        command: z.string({
            required_error: "Command is required"
        }),
        type: z.string({
            required_error: "Type is required"
        }),
        event: z.string({
            required_error: "Event is required"
        }),
        event2: z.string({}),
        repeat: z.number({}),
        period: z.number({
            required_error: "Period is required"
        }),
    }))
    .mutation(async ({ctx, input}) => {
        const { command, type, event, event2, repeat, period } = input;
        if(!command || !type || !event || !period) {
            return returnCommandResult(
                UNKNOWN_COMMAND,
                command,
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
        switch(type) {
            case PREDICT_LTV:
                result = getLTVPrediction(event, repeat, period) as CommandResultType;
                return await returnCommandResult(
                    type,
                    command,
                    result,
                    ctx.session.user.id,
                );
            case PREDICT_CHURN:
                result = getChurnPrediction(event, repeat, period) as CommandResultType;
                return await returnCommandResult(
                    type,
                    command,
                    result,
                    ctx.session.user.id,
                )
            case PREDICT_LIKELIHOOD:
                result = getLikelihoodEvent(event, event2, period) as CommandResultType;
                return await returnCommandResult(
                    type,
                    command,
                    result,
                    ctx.session.user.id,
                )
            case MODEL_CORRELATION:
                result = getModelCorrelation(event, event2, period) as CommandResultType;
                return await returnCommandResult(
                    type,
                    command,
                    result,
                    ctx.session.user.id,
                )
            default:
                return {
                    type: UNKNOWN_COMMAND,
                    input: command,
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
})
