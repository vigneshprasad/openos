import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { s3 } from '~/server/services/aws'

export const awsRouter = createTRPCRouter({
    
    getPresignedUrl: protectedProcedure
        .query(async () => {

            const url = await s3.getSignedUrlPromise('putObject', {
                Bucket: 'openos',
                Key: "text.xls",
            })
            return url;
        }),

});
