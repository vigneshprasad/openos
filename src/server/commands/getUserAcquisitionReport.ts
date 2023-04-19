import { prisma } from "~/server/db";

import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type ResourceSchemaEmbeddings } from "@prisma/client";
import { Client } from "pg";

import moment from "moment";
import { getQuery } from "~/utils/getQuery";
import { executeQuery } from "~/utils/executeQuery";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";
import { removeEmptyColumns } from "~/utils/removeEmptyColumns";

type UsersBySource = {
    date: Date,
    facebook: number,
    google: number,
    organic: number,
    total: number
}

type UsersBySourceQuery = {
    facebook: string,
    google: string,
    organic: string,
    total: string
}

export const getUserAcquisitionReport = async (query: string, userId: string) => {
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
                message: 'Database resource not found',
                cause: 'Please add a database resource to your account to get your report.'
            }
        ]
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

    const timeSeries = getMonthlyTimeSeries(13);    

    const {
        data: usersBySource,
        query: usersBySourceQuery 
    } = await getUserBySource(client, embeddings, timeSeries);
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const organicAcquisition: ExcelCell[] = [{value: 'Organic Acquisition', hint: usersBySourceQuery.organic}];
    const organicAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const facebookAcquisition: ExcelCell[] = [{value: 'Facebook Acquisition', hint: usersBySourceQuery.facebook}];
    const facebookAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const googleAcquisition: ExcelCell[] = [{value: 'Google Acquisition', hint: usersBySourceQuery.google}];
    const googleAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const otherAcquisition: ExcelCell[] = [{value: 'Other Acquisition'}];
    const otherAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const totalAcquisition: ExcelCell[] = [{value: 'Total Acquisition', hint: usersBySourceQuery.total}];
    const percentOrganicUsers: ExcelCell[] = [{value: 'Organic as a % of total'}];

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        date?.setDate(date.getDate() - 1);
        if(!date) continue;
        reportHeader.push({
            value: date.toDateString()
        })

        //Users by Source
        if(usersBySource[i]) {
            const userBySource = usersBySource[i] as UsersBySource;
            const prevUserBySource = usersBySource[i - 1] as UsersBySource;
            if(!userBySource || !prevUserBySource) continue;
            facebookAcquisition.push({value: userBySource.facebook});
            facebookAcquisitionGrowth.push({
                value: ((userBySource?.facebook - prevUserBySource.facebook) / (prevUserBySource.facebook) * 100).toFixed(2),
                unit: '%'
            })
            googleAcquisition.push({value: userBySource.google});
            googleAcquisitionGrowth.push({
                value: ((userBySource?.google - prevUserBySource.google) / (prevUserBySource.google) * 100).toFixed(2),
                unit: '%'
            })
            organicAcquisition.push({value: userBySource.organic});
            organicAcquisitionGrowth.push({
                value: ((userBySource?.organic - prevUserBySource.organic) / (prevUserBySource.organic) * 100).toFixed(2),
                unit: '%'
            });
            const otherAcquisitionNumber = userBySource.total
                - userBySource?.facebook
                - userBySource?.google
                - userBySource?.organic;
            const otherAcquisitionPrevNumber = prevUserBySource.total
                - prevUserBySource?.facebook
                - prevUserBySource?.google
                - prevUserBySource?.organic;
            
            otherAcquisition.push({value: otherAcquisitionNumber});
            otherAcquisitionGrowth.push({
                value: ((otherAcquisitionNumber - otherAcquisitionPrevNumber) / (otherAcquisitionPrevNumber) * 100).toFixed(2),
                unit: '%'
            });
            totalAcquisition.push({value: usersBySource[i]?.total as number});
            percentOrganicUsers.push({
                value: ((userBySource?.organic) / (userBySource.total) * 100).toFixed(2),
                unit: '%'
            });
        }
    }

    reportTable.push(reportHeader);
    reportTable.push(organicAcquisition);
    reportTable.push(organicAcquisitionGrowth);
    reportTable.push(facebookAcquisition);
    reportTable.push(facebookAcquisitionGrowth);
    reportTable.push(googleAcquisition);
    reportTable.push(googleAcquisitionGrowth);
    reportTable.push(otherAcquisition);
    reportTable.push(otherAcquisitionGrowth);
    reportTable.push(totalAcquisition);
    reportTable.push(percentOrganicUsers);

    await client.end();

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );

    return [
        {
            heading: 'User Acquisition',
            sheet: removeEmptyColumns(reportTableWithProjections)
        },
        undefined
    ]
}

export const getUserBySource = async (client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[]) : Promise<{
    data: UsersBySource[],
    query: UsersBySourceQuery
}> => {
    
    const userBySource:UsersBySource[] = [{
        date: timeSeries[0] as Date,
        facebook: 0,
        google: 0,
        organic: 0,
        total: 0
    }];
    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");
    const fbPrompt = `Get number of users with source Facebook that joined from ${timeSeries0} to ${timeSeries1}`
    const organicPrompt = `Get number of users without any source that joined from ${timeSeries0} to ${timeSeries1}`
    const totalPrompt = `Get number of users with that joined from ${timeSeries0} to ${timeSeries1}`
    const fbSqlQuery = await getQuery(client, embeddings, fbPrompt);
    const googleSqlQuery = fbSqlQuery.replace("Facebook", "Google").replace('facebook', 'google');
    const organicSqlQuery = await getQuery(client, embeddings, organicPrompt);
    const totalSqlQuery = await getQuery(client, embeddings, totalPrompt);

    if(!fbSqlQuery || !googleSqlQuery || !totalSqlQuery || !organicSqlQuery) {
        return {
            data: [],
            query: {
                facebook: fbSqlQuery,
                google: googleSqlQuery,
                organic: organicSqlQuery,
                total: totalSqlQuery
            }
        }
    }
    if(!fbSqlQuery.includes(timeSeries0) || !googleSqlQuery.includes(timeSeries1) || !totalSqlQuery.includes(timeSeries0) || !organicSqlQuery.includes(timeSeries0)
        || !fbSqlQuery.includes(timeSeries1) || !googleSqlQuery.includes(timeSeries1) || !totalSqlQuery.includes(timeSeries1) || !organicSqlQuery.includes(timeSeries1)) {
            return {
                data: [],
                query: {
                    facebook: fbSqlQuery,
                    google: googleSqlQuery,
                    organic: organicSqlQuery,
                    total: totalSqlQuery
                }
            };
    }

    try {
        for(let i = 1; i < timeSeries.length; i++) {
            if(!timeSeries[i] || !timeSeries[i - 1])  {
                continue;
            }
            const date0 = moment(timeSeries[i - 1]).format('YYYY-MM-DD');
            const date1 = moment(timeSeries[i]).format('YYYY-MM-DD');
            const fbQuery = fbSqlQuery.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const googleQuery = googleSqlQuery.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const organicQuery = organicSqlQuery.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const totalQuery = totalSqlQuery.replace(timeSeries0, date0).replace(timeSeries1, date1);
            let fbCount = 0;
            let googleCount = 0;
            let organicCount = 0;
            let totalCount = 0;
            try {
                const fbResult = await executeQuery(client, fbQuery);
                fbCount = fbResult[0]?.count as number;
            } catch (error) {
            }
            try {
                const googleResult = await executeQuery(client, googleQuery);
                googleCount = googleResult[0]?.count as number;
            } catch (error) {
            }
            try {
                const organicResult = await executeQuery(client, organicQuery);
                organicCount = organicResult[0]?.count as number;
            } catch (error) {
            }
            try {
                const totalResult = await executeQuery(client, totalQuery);
                totalCount = totalResult[0]?.count as number;
            } catch (error) {
            }
            userBySource.push({
                date: timeSeries[i] as Date,
                facebook: fbCount,
                google: googleCount,
                organic: organicCount,
                total: totalCount
            })
        }
    } catch (error) {
        console.log(error);
    }

    return {
        data: userBySource,
        query: {
            facebook: fbSqlQuery,
            google: googleSqlQuery,
            organic: organicSqlQuery,
            total: totalSqlQuery
        }
    };
}



