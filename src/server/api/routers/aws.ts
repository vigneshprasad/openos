import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import AWS from 'aws-sdk'
import { z } from "zod";

export const awsRouter = createTRPCRouter({
    
    getPresignedUrl: protectedProcedure
        .input(z.object({
            name: z.string({
                required_error: "Name is required"
            }),
        }))
        .mutation(async ({ctx, input}) => {
            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: 'ap-south-1',
                signatureVersion: 'v4',
            })
            
            const s3 = new S3Client({
                region: 'ap-south-1',
            });

            const command = new PutObjectCommand(
                { 
                    Bucket: 'openos', 
                    Key: `${ctx.session.user.id}-${input.name}` 
                });
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            return url;
        }),

    create: protectedProcedure
        .input(z.object({ 
            name: z.string({
              required_error: "Name is required"
            }),
            url: z.string({
              required_error: "Url is required"
            }),
        }))
        .mutation(async ({ ctx, input }) => {    
            return await ctx.prisma.bankStatement.create({
                data: {
                    name: input.name,
                    url: input.url,
                    userId: ctx.session.user.id,
                },
            });
        })
});
