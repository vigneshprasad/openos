import { type UserPrediction } from "@prisma/client";
import moment, { type Moment } from "moment";
import { prisma } from "~/server/db";

export const getUserPredictions = async (modelId: string, start?: Moment, end?: Moment): Promise<UserPrediction[]> => {
    let userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
        }
    });

    let userPredictions:UserPrediction[] = [];

    userPredictionCount = userPredictionCount > 5000 ? 3000 : userPredictionCount;

    for(let i = 0; i < userPredictionCount; i = i + 1000) {
        
        const userPredictionChunk = await prisma.userPrediction.findMany({
            where: {
                dataModelId: modelId,
            },
            orderBy: {
                dateOfEvent: 'desc',
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
    let userPredictionCount = await prisma.userPrediction.count({
        where: {
            dataModelId: modelId,
        },
    });

    let userPredictions:UserPrediction[] = [];

    userPredictionCount = userPredictionCount > 5000 ? 3000 : userPredictionCount;

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