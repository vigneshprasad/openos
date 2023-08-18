import { type UserPrediction } from "@prisma/client";
import { type Moment } from "moment";
import { prisma } from "~/server/db";

export const getUserPredictions = async (modelId: string, start?: Moment, end?: Moment): Promise<UserPrediction[]> => {
    const userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
            dateOfEvent: {
                gte: start?.toDate(),
                lt: end?.add(1,'days').toDate(),
            },
        }
    });

    const userPredictions:UserPrediction[] = [];
    for(let i = 0; i < userPredictionCount; i = i + 1000) {

        const remaining = userPredictionCount - i;
        
        const userPredictionChunk = await prisma.userPrediction.findMany({
            where: {
                dataModelId: modelId,
                dateOfEvent: {
                    gte: start?.toDate(),
                    lt: end?.add(1,'days').toDate(),
                },
            },
            orderBy: {
                dateOfEvent: 'desc',
            },
            skip: i,
            take: remaining > 1000 ? 1000 : remaining,
        });
        userPredictions.push(...userPredictionChunk);
    }

    return userPredictions;
}

export const getUserPredictionsSortedByProbability = async (modelId: string, start?: Moment, end?: Moment, orderByAsc?: boolean ): Promise<UserPrediction[]> => {
    const userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
            dateOfEvent: {
                gte: start?.toDate(),
                lt: end?.add(1,'days').toDate(),
            },
        },
    });

    const userPredictions:UserPrediction[] = [];

    for(let i = 0; i < userPredictionCount; i = i + 1000) {

        const remaining = userPredictionCount - i;

        const userPredictionChunk = await prisma.userPrediction.findMany({
            where: {
                dataModelId: modelId,
                dateOfEvent: {
                    gte: start?.toDate(),
                    lt: end?.add(1,'days').toDate(),
                },
            },
            orderBy: {
                probability: orderByAsc ? 'asc' : 'desc',
            },
            skip: i,
            take: remaining > 1000 ? 1000 : remaining,
        });
        userPredictions.push(...userPredictionChunk);
    }
    return userPredictions;
}