import { prisma } from "~/server/db";

import { GET_REPORT } from "~/constants/commandConstants";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type ResourceSchemaEmbeddings } from "@prisma/client";
import { Client } from "pg";

import moment from "moment";
import { executeQuery } from "~/utils/executeQuery";
import { processPrompt } from "~/utils/processPrompt";

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
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Database not found',
                    cause: 'Please add a database resource to your account to get your report.'
                }
            ]
        };
    }
    
    const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false, }
    });
    await client.connect();

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
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'User activity description not found',
                    cause: 'Please add user activity to your database to get your report.'
                }
            ]
        };
    }

    const timeSeries = getMonthlyTimeSeries(13);    
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const dailyActiveUsers: ExcelCell[] = [{value: 'Daily Active Users (DAUs)'}];
    const dailyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const weeklyActiveUsers: ExcelCell[] = [{value: 'Weekly Active Users (WAUs)'}];
    const weeklyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const monthlyActiveUsers: ExcelCell[] = [{value: 'Monthly Active Users (MAUs)'}];
    const monthlyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];

    const activityString = `Number of distinct users with ${activityDescription.activity}`;
    const activityPrompt = await processPrompt(activityString, client, embeddings, timeSeries);
    const activeUsers: ActiveUsers[] = await getActiveUsers(client, embeddings, timeSeries, activityPrompt);

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
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
            });

            weeklyActiveUsers.push({ value: wauNumber.toFixed(2) });
            weeklyActiveUsersGrowth.push({
                value: ((wauNumber - prevWauNumber) / (wauNumber) * 100).toFixed(2),
            });

            monthlyActiveUsers.push({ value: mauNumber.toFixed(2) });
            monthlyActiveUsersGrowth.push({
                value: ((mauNumber - prevMauNumber) / (mauNumber) * 100).toFixed(2),
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

    await client.end();

    return {
        type: GET_REPORT,
        data: [
            reportTable,
            undefined
        ]
    }
}

const getActiveUsers = async (client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[], query: string) : Promise<ActiveUsers[]> => {
    const result: ActiveUsers[] = [{
        date: timeSeries[0] as Date,
        dau: 0,
        wau: 0,
        mau: 0
    }];

    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");
    
    query = query.replace('<DATE 1>', timeSeries0).replace('<DATE 2>', timeSeries1);

    if(!query || !query.includes(timeSeries0) || !query.includes(timeSeries1)) {
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
                const sqlQuery = query.replace(timeSeries0, date0).replace(timeSeries1, date1);
                try {
                    const step1Result = await executeQuery(client, sqlQuery);
                    dauTotal += (Number(step1Result[0]?.count));
                } catch (error) {
                }
            }
            let wauTotal = 0;
            for(let j = 0; j < 4; j++) {
                const date0 = moment(timeSeries[i - 1]).add(j * 7, 'days').format('YYYY-MM-DD');
                const date1 = moment(timeSeries[i - 1]).add((j + 1) * 7, 'days').format('YYYY-MM-DD');
                const sqlQuery = query.replace(timeSeries0, date0).replace(timeSeries1, date1);
                try {
                    const step1Result = await executeQuery(client, sqlQuery);
                    wauTotal += (Number(step1Result[0]?.count));
                } catch (error) {
                }
            }
            const date0 = moment(timeSeries[i - 1]).format('YYYY-MM-DD');
            const date1 = moment(timeSeries[i]).format('YYYY-MM-DD');
            const sqlQuery = query.replace(timeSeries0, date0).replace(timeSeries1, date1);
            let mauTotal = 0;
            try {
                const step1Result = await executeQuery(client, sqlQuery);
                mauTotal = Number(step1Result[0]?.count);
            }
            catch (error) {
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

    console.log(result);
    return result;
}



