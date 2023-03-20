import { createTRPCRouter } from "~/server/api/trpc";
import { templateRouter } from "~/server/api/routers/template";
import { userTemplateRouter } from "~/server/api/routers/userTemplate";
import { databaseResourceRouter } from "./routers/databaseResource";
import { queryRouter } from "./routers/queryRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  databaseResource: databaseResourceRouter,
  template: templateRouter,
  userTemplate: userTemplateRouter,
  queryRouter: queryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
