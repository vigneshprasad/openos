import { prisma } from "~/server/db";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type SavedQuery, type ResourceSchemaEmbeddings, type DatabaseResource } from "@prisma/client";
import moment from "moment";
import { processPrompt } from "~/utils/processPrompt";
import { executeQuery } from "~/utils/executeQuery";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";

type RetentionData = {
    date: Date,
    total: number,
    d0: number,
    d1: number,
    d7: number,
    d14: number,
    d30: number,
}

type UserCount = {
    count: number
}

export const getRetentionReport = async (query: string, userId: string) => {
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

    const {
        data: retentionData,
        query: retentionDataQuery
    } = await getRetentionData(databaseResource, embeddings, timeSeries, activityDescription.activity);

    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const totalUsers: ExcelCell[] = [{value: 'Total Users'}];
    const d0Retention: ExcelCell[] = [{value: 'D0 Retention', query: retentionDataQuery}];
    const d1Retention: ExcelCell[] = [{value: 'D1 Retention'}];
    const d7Retention: ExcelCell[] = [{value: 'D7 Retention'}];
    const d14Retention: ExcelCell[] = [{value: 'D14 Retention'}];
    const d30Retention: ExcelCell[] = [{value: 'D30 Retention'}];

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        date?.setDate(date.getDate() - 1);
        if(!date) continue;
        reportHeader.push({
            value: date.toDateString()
        })

        // Retention
        if(retentionData[i]) {
            const retentionDataPerMonth = retentionData[i] as RetentionData;
            totalUsers.push({ value: retentionDataPerMonth.total });
            d0Retention.push({ value: retentionDataPerMonth.d0.toFixed(2), unit: '%'});
            d1Retention.push({ value: retentionDataPerMonth.d1.toFixed(2), unit: '%' });
            d7Retention.push({ value: retentionDataPerMonth.d7.toFixed(2), unit: '%' });
            d14Retention.push({ value: retentionDataPerMonth.d14.toFixed(2), unit: '%' });
            d30Retention.push({ value: retentionDataPerMonth.d30.toFixed(2), unit: '%' });

        }
    }

    reportTable.push(reportHeader);
    reportTable.push(totalUsers);
    reportTable.push(d0Retention);
    reportTable.push(d1Retention);
    reportTable.push(d7Retention);
    reportTable.push(d14Retention);
    reportTable.push(d30Retention);

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );

    return [
        {
            heading: 'User Retention',
            sheet: reportTableWithProjections
        },
        undefined
    ]
}

const getRetentionData = async (
    databaseResource: DatabaseResource, 
    embeddings: ResourceSchemaEmbeddings[], 
    timeSeries: Date[], 
    activityDescription: string) : Promise<{
    data: RetentionData[],
    query?: SavedQuery
}> => {
    const result = [
        {
            date: timeSeries[0] as Date,
            total: 0,
            d0: 0,
            d1: 0,
            d7: 0,
            d14: 0,
            d30: 0,
        }
    ]

    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");
    const dummyIdentifier = "dummytest@gmail.com"

    let userListQuery = await processPrompt(
        `Get emails and created at of users that joined between ${timeSeries0} and ${timeSeries1} from user table`,
        embeddings, timeSeries, databaseResource.id, databaseResource.type
    );
    
    let userList;
    try {
        userList = await executeQuery(databaseResource, userListQuery);
    } catch (error) {
        console.log(error);
        return {
            data: [],
            query: undefined
        };
    }

    userListQuery =userListQuery.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')

    let retentionActivityPrompt, retentionActivitySavedQuery;
    retentionActivitySavedQuery = await prisma.savedQuery.findFirst({
        where: {
            databaseResourceId: databaseResource.id,
            reportKey: 'Retention Activity',
        }
    });
    
    if(retentionActivitySavedQuery) {
        if(retentionActivitySavedQuery.feedback === 1) {
            retentionActivityPrompt = retentionActivitySavedQuery.query;
        } else {
            retentionActivityPrompt = await processPrompt(
                `${activityDescription} by user with email ${dummyIdentifier} between ${timeSeries0} and ${timeSeries1}`,
                embeddings, timeSeries, databaseResource.id, databaseResource.type
            );
            retentionActivityPrompt = retentionActivityPrompt.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
            retentionActivitySavedQuery = await prisma.savedQuery.update({
                where: {
                    id: retentionActivitySavedQuery.id
                },
                data: {
                    query: retentionActivityPrompt
                }
            });
        }
    } else {
        retentionActivityPrompt = await processPrompt(
            `${activityDescription} by user with email ${dummyIdentifier} between ${timeSeries0} and ${timeSeries1}`,
            embeddings, timeSeries, databaseResource.id, databaseResource.type
        );
        retentionActivityPrompt = retentionActivityPrompt.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
        retentionActivitySavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResource.id,
                reportKey: 'Retention Activity',
                query: retentionActivityPrompt,
                feedback: 0
            }
        });
    }

    const identifierKey = Object.keys(userList[0] as object)[0];
    const dateJoinedKey = Object.keys(userList[0] as object)[1];
    
    if(!userListQuery || !userListQuery.includes('<DATE-1>') || !userListQuery.includes('<DATE-2>') 
        || !dateJoinedKey ||!identifierKey || !retentionActivityPrompt || !retentionActivityPrompt.includes('<DATE-1>') || !retentionActivityPrompt.includes('<DATE-2>')) {
        return {
            data: [],
            query: retentionActivitySavedQuery
        };
    }

    for(let i = 1; i < timeSeries.length; i++) {
        if(!timeSeries[i] || !timeSeries[i - 1])  {
            continue;
        }
        const date0 = moment(timeSeries[i - 1]).format('YYYY-MM-DD');
        const date1 = moment(timeSeries[i]).format('YYYY-MM-DD');

        const userListQueryNew = userListQuery.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
        const userList = await executeQuery(databaseResource, userListQueryNew);

        let d0Count = 0;
        let d1Count = 0;
        let d7Count = 0;
        let d14Count = 0;
        let d30Count = 0;

        for(let j = 0; j < userList.length; j++) {
            const user = userList[j];
            if(!user) continue;
            const identifier = user[identifierKey] as string;
            const dateJoined = user[dateJoinedKey] as string;

            const start = moment(dateJoined).format("YYYY-MM-DD");
            const d0End = moment(dateJoined).add(1, 'days').format("YYYY-MM-DD");
            const d1End = moment(dateJoined).add(2, 'days').format("YYYY-MM-DD");
            const d7Start = moment(dateJoined).add(7, 'days').format("YYYY-MM-DD");
            const d7End = moment(dateJoined).add(8, 'days').format("YYYY-MM-DD");
            const d14Start = moment(dateJoined).add(14, 'days').format("YYYY-MM-DD");
            const d14End = moment(dateJoined).add(15, 'days').format("YYYY-MM-DD");
            const d30Start = moment(dateJoined).add(30, 'days').format("YYYY-MM-DD");
            const d30End = moment(dateJoined).add(31, 'days').format("YYYY-MM-DD");

            const activityQueryD0 = retentionActivityPrompt.replaceAll('<DATE-1>', start).replaceAll('<DATE-2>', d0End).replaceAll(dummyIdentifier, identifier);
            const activityQueryD1 = retentionActivityPrompt.replaceAll('<DATE-1>', d0End).replaceAll('<DATE-2>', d1End).replaceAll(dummyIdentifier, identifier);
            const activityQueryD7 = retentionActivityPrompt.replaceAll('<DATE-1>', d7Start).replaceAll('<DATE-2>', d7End).replaceAll(dummyIdentifier, identifier);
            const activityQueryD14 = retentionActivityPrompt.replaceAll('<DATE-1>', d14Start).replaceAll('<DATE-2>', d14End).replaceAll(dummyIdentifier, identifier);
            const activityQueryD30 = retentionActivityPrompt.replaceAll('<DATE-1>', d30Start).replaceAll('<DATE-2>', d30End).replaceAll(dummyIdentifier, identifier);

            try {
                const activityCountD0 = await executeQuery(databaseResource, activityQueryD0);
                const activityCountD1 = await executeQuery(databaseResource, activityQueryD1);
                const activityCountD7 = await executeQuery(databaseResource, activityQueryD7);
                const activityCountD14 = await executeQuery(databaseResource, activityQueryD14);
                const activityCountD30 = await executeQuery(databaseResource, activityQueryD30);

                if(activityCountD0.length > 0 && (activityCountD0[0] as UserCount).count > 0 ) d0Count++;
                if(activityCountD1.length > 0 && (activityCountD1[0] as UserCount).count > 0) d1Count++;
                if(activityCountD7.length > 0 && (activityCountD7[0] as UserCount).count > 0) d7Count++;
                if(activityCountD14.length > 0 && (activityCountD14[0] as UserCount).count > 0) d14Count++;
                if(activityCountD30.length > 0 && (activityCountD30[0] as UserCount).count > 0) d30Count++;

            } catch(e) {
                console.log(e);
                continue;
            }
            
        }

        result.push({
            date: timeSeries[i] as Date,
            total: userList.length,
            d0: d0Count * 100 / userList.length,
            d1: d1Count * 100 / userList.length,
            d7: d7Count * 100 / userList.length,
            d14: d14Count * 100 / userList.length,
            d30: d30Count * 100 / userList.length,
        });
    }

    return {
        data: result,
        query: retentionActivitySavedQuery
    };
};



