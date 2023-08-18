import { type Prisma } from "@prisma/client";
import { type Moment } from "moment";
import { prisma } from "~/server/db";

export type UserPredictionPartial = {
    id: string,
    userDistinctId: string,
    dateOfEvent: Date,
    probability: number,
    actualResult: number | null,
    feedback: number | null,
    userData?: Prisma.JsonValue,
}

export const getUserPredictions = async (modelId: string, start?: Moment, end?: Moment, excludeUserData?: boolean): Promise<UserPredictionPartial[]> => {
    const userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
            dateOfEvent: {
                gte: start?.toDate(),
                lt: end?.add(1,'days').toDate(),
            },
        }
    });

    const userPredictions:UserPredictionPartial[] = [];
    for(let i = 0; i < userPredictionCount; i = i + 5000) {

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
            select: {
                id: true,
                userDistinctId: true,
                dateOfEvent: true,
                probability: true,
                actualResult: true,
                feedback: true,
                userData: excludeUserData ? false : true,
            },
            skip: i,
            take: remaining > 5000 ? 5000 : remaining,
        });
        userPredictions.push(...userPredictionChunk);
    }

    return userPredictions;
}

export const getUserPredictionsSortedByProbability = async (modelId: string, start?: Moment, end?: Moment, skip?:number, orderByAsc?: boolean): Promise<UserPredictionPartial[]> => {
    
    const userPredictions = await prisma.userPrediction.findMany({
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
        skip: skip,
        select: {
            id: true,
            userDistinctId: true,
            dateOfEvent: true,
            probability: true,
            actualResult: true,
            feedback: true,
            userData: true,
        },
    });
    return userPredictions;
}