import { type UserPrediction } from "@prisma/client";
import moment, { type Moment } from "moment";
import { prisma } from "~/server/db";

export const getUserPredictions = async (modelId: string, start?: Moment, end?: Moment): Promise<UserPrediction[]> => {
    const userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
        }
    });

    let userPredictions:UserPrediction[] = [];

    for(let i = 0; i < userPredictionCount; i = i + 1000) {
        const userPredictionChunk = await prisma.userPrediction.findMany({
            where: {
                dataModelId: modelId,
            },
            skip: i,
            take: 1000,
        });
        userPredictions.push(...userPredictionChunk);
    }

    if(start) {
        userPredictions = userPredictions.filter((userPrediction) => {
            return moment(userPrediction.dateOfEvent).isSameOrAfter(start, 'days');
        });
    } 
    if(end) {
        userPredictions = userPredictions.filter((userPrediction) => {
            return moment(userPrediction.dateOfEvent).isSameOrBefore(end, 'days');
        });
    }

    return userPredictions;
}

export const getUserPredictionsSortedByProbability = async (modelId: string, start?: Moment, end?: Moment, orderByAsc?: boolean ): Promise<UserPrediction[]> => {
    const userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
        },
    });

    let userPredictions:UserPrediction[] = [];

    for(let i = 0; i < userPredictionCount; i = i + 1000) {
        const userPredictionChunk = await prisma.userPrediction.findMany({
            where: {
                dataModelId: modelId,
            },
            orderBy: {
                probability: orderByAsc ? 'asc' : 'desc',
            },
            skip: i,
            take: 1000,
        });
        userPredictions.push(...userPredictionChunk);
    }

    if(start) {
        userPredictions = userPredictions.filter((userPrediction) => {
            return moment(userPrediction.dateOfEvent).isSameOrAfter(start, 'days');
        });
    } 
    if(end) {
        userPredictions = userPredictions.filter((userPrediction) => {
            return moment(userPrediction.dateOfEvent).isSameOrBefore(end, 'days');
        });
    }

    return userPredictions;
}