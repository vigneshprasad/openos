import { createTRPCRouter } from "~/server/api/trpc";
import { templateRouter } from "~/server/api/routers/template";
import { databaseResourceRouter } from "./routers/databaseResource";
import { razorpayResourceRouter } from "./routers/razorpayResource";
import { commandRouter } from "./routers/command";
import { awsRouter } from "./routers/aws";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  databaseResource: databaseResourceRouter,
  razorpayResource: razorpayResourceRouter,
  template: templateRouter,
  commandRouter: commandRouter,
  aws: awsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
