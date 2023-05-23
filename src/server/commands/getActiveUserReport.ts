import { prisma } from "~/server/db";

import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type DatabaseResource, type ResourceSchemaEmbeddings } from "@prisma/client";

import moment from "moment";
import { executeQuery } from "~/utils/executeQuery";
import { processPrompt } from "~/utils/processPrompt";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";
import { NUMBER_OF_RETRIES } from "~/constants/config";

type ActiveUsers = {
    date: Date,
    dau: number,
    wau: number,
    mau: number,
}

export const getActiveUserReport = async (query: string, userId: string) => {
    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    
    const databaseResource = databaseResources[0];
    if(!databaseResource) {
        return [
            undefined, 
            {
                query: 'Request unprocessed',
                message: 'Database not found',
                cause: 'Please add a database resource to your account to get your report.'
            }
        ]
    }

    const embeddings = await prisma.resourceSchemaEmbeddings.findMany({
        where: {
            databaseResourceId: databaseResource.id
        }
    });

    const activityDescription = await prisma.activityDescription.findUnique({
        where: {
            userId: userId
        }
    })

    if(!activityDescription) {
        return [
            undefined, 
            {
                query: 'Request unprocessed',
                message: 'User activity description not found',
                cause: 'Please add user activity to your database to get your report.'
            }
        ]
    }

    const timeSeries = getMonthlyTimeSeries(13);
    
    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const activityString = `Number of distinct users with ${activityDescription.activity}`;

    let activitySavedQuery, activityPrompt;
    activitySavedQuery = await prisma.savedQuery.findFirst({
        where: {
            databaseResourceId: databaseResource.id,
            reportKey: 'User Activity'
        }
    });

    if(activitySavedQuery) {
        if(activitySavedQuery.feedback === 1) {
            activityPrompt = activitySavedQuery.query;
        } else {
            activityPrompt = await processPrompt(activityString, embeddings, timeSeries, databaseResource.id, databaseResource.type);
            activityPrompt = activityPrompt.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
            activitySavedQuery = await prisma.savedQuery.update({
                where: {
                    id: activitySavedQuery.id
                },
                data: {
                    query: activityPrompt
                }
            });
        }
    } else {
        activityPrompt = await processPrompt(activityString, embeddings, timeSeries, databaseResource.id, databaseResource.type);
        activityPrompt = activityPrompt.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
        activitySavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResource.id,
                reportKey: 'User Activity',
                query: activityPrompt,
                feedback: 0
            }
        });
    }

    const activeUsers: ActiveUsers[] = await getActiveUsers(databaseResource, embeddings, timeSeries, activityPrompt);

    const dailyActiveUsers: ExcelCell[] = [{value: 'Daily Active Users (DAUs)', query: activitySavedQuery}];
    const dailyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const weeklyActiveUsers: ExcelCell[] = [{value: 'Weekly Active Users (WAUs)'}];
    const weeklyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const monthlyActiveUsers: ExcelCell[] = [{value: 'Monthly Active Users (MAUs)'}];
    const monthlyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        date?.setDate(date.getDate() - 1);
        if(!date) continue;
        reportHeader.push({
            value: date.toDateString()
        })

        // Active Users
        if(activeUsers[i]) {
            const activeUser = activeUsers[i] as ActiveUsers;
            const prevActiveUser = activeUsers[i - 1] as ActiveUsers;
            const dauNumber = activeUser.dau
            const wauNumber = activeUser.wau
            const mauNumber = activeUser.mau

            const prevDauNumber = prevActiveUser.dau
            const prevWauNumber = prevActiveUser.wau
            const prevMauNumber = prevActiveUser.mau

            dailyActiveUsers.push({ value: dauNumber.toFixed(2) });
            dailyActiveUsersGrowth.push({
                value: ((dauNumber - prevDauNumber) / (dauNumber) * 100).toFixed(2),
                unit: '%'
            });

            weeklyActiveUsers.push({ value: wauNumber.toFixed(2) });
            weeklyActiveUsersGrowth.push({
                value: ((wauNumber - prevWauNumber) / (wauNumber) * 100).toFixed(2),
                unit: '%'
            });

            monthlyActiveUsers.push({ value: mauNumber.toFixed(2) });
            monthlyActiveUsersGrowth.push({
                value: ((mauNumber - prevMauNumber) / (mauNumber) * 100).toFixed(2),
                unit: '%'
            });
        }
    }

    reportTable.push(reportHeader);

    reportTable.push(dailyActiveUsers);
    reportTable.push(dailyActiveUsersGrowth);
    reportTable.push(weeklyActiveUsers);
    reportTable.push(weeklyActiveUsersGrowth);
    reportTable.push(monthlyActiveUsers);
    reportTable.push(monthlyActiveUsersGrowth);

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );


    return [
        {
            heading: 'Active Users',
            sheet: reportTableWithProjections,
        },
        undefined
    ]
}

const getActiveUsers = async (databaseResource:DatabaseResource, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[], query: string) : Promise<ActiveUsers[]> => {
    const result: ActiveUsers[] = [{
        date: timeSeries[0] as Date,
        dau: 0,
        wau: 0,
        mau: 0
    }];

    for(let attempt = 0; attempt < NUMBER_OF_RETRIES; attempt++) {
        if(!query || !query.includes('<DATE-1>') || !query.includes('<DATE-2>')) {
            return [];
        }

        try {
            for(let i = 1; i < timeSeries.length; i++) {
                if(!timeSeries[i] || !timeSeries[i - 1])  {
                    continue;
                }
                let dauTotal = 0;
                for(let j = 0; j < 30; j++) {
                    const date0 = moment(timeSeries[i - 1]).add(j, 'days').format('YYYY-MM-DD');
                    const date1 = moment(timeSeries[i - 1]).add(j + 1, 'days').format('YYYY-MM-DD');
                    const sqlQuery = query.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
                    try {
                        const step1Result = await executeQuery(databaseResource, sqlQuery);
                        dauTotal += (Number(step1Result[0]?.count));
                    } catch (error) {
                        if(i !== timeSeries.length - 1) continue;
                    }
                }
                let wauTotal = 0;
                for(let j = 0; j < 4; j++) {
                    const date0 = moment(timeSeries[i - 1]).add(j * 7, 'days').format('YYYY-MM-DD');
                    const date1 = moment(timeSeries[i - 1]).add((j + 1) * 7, 'days').format('YYYY-MM-DD');
                    const sqlQuery = query.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
                    try {
                        const step1Result = await executeQuery(databaseResource, sqlQuery);
                        wauTotal += (Number(step1Result[0]?.count));
                    } catch (error) {
                        if(i !== timeSeries.length - 1) continue;
                    }
                }
                const date0 = moment(timeSeries[i - 1]).format('YYYY-MM-DD');
                const date1 = moment(timeSeries[i]).format('YYYY-MM-DD');
                const sqlQuery = query.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
                let mauTotal = 0;
                try {
                    const step1Result = await executeQuery(databaseResource, sqlQuery);
                    mauTotal = Number(step1Result[0]?.count);
                }
                catch (error) {
                    if(i !== timeSeries.length - 1) continue;
                }
                result.push({
                    date: timeSeries[i] as Date,
                    dau: dauTotal / 30,
                    wau: wauTotal / 4,
                    mau: mauTotal,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
    return result;
}



