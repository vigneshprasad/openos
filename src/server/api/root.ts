import { createTRPCRouter } from "~/server/api/trpc";
import { databaseResourceRouter } from "./routers/databaseResource";
import { razorpayResourceRouter } from "./routers/razorpayResource";
import { commandRouter } from "./routers/command";
import { awsRouter } from "./routers/aws";
import { bankStatementRouter } from "./routers/bankStatement";
import { savedQueryRouter } from "./routers/savedQuery";
import { userRouter } from "./routers/user";
import { commandHistoryRouter } from "./routers/commandHistory";
import { stripeResourceRouter } from "./routers/stripeResource";
import { predictiveAnalysisCommandRouter } from "./routers/predictiveAnalysisCommand";
import { mixpanelResourceRouter } from "./routers/mixpanelResource";
import { dataModelRouter } from "./routers/dataModelRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  databaseResource: databaseResourceRouter,
  razorpayResource: razorpayResourceRouter,
  mixpanelResource: mixpanelResourceRouter,
  stripeResource: stripeResourceRouter,
  commandRouter: commandRouter,
  aws: awsRouter,
  bankStatement: bankStatementRouter,
  savedQuery: savedQueryRouter,
  user: userRouter,
  commandHistory: commandHistoryRouter,
  predictiveAnalysisCommand: predictiveAnalysisCommandRouter,
  dataModelRouter: dataModelRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
