import { prisma } from "~/server/db";

import { GET_REPORT } from "~/constants/commandConstants";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type SavedQuery, type ResourceSchemaEmbeddings, type funnelSteps } from "@prisma/client";
import { Client } from "pg";

import moment from "moment";
import { processPrompt } from "~/utils/processPrompt";
import { executeQuery } from "~/utils/executeQuery";

type UsersByFunnelStep = {
    date: Date,
    step1: number,
    step2: number,
    step3: number,
    total: number,
}

type FunnelQuery = {
    step1: SavedQuery,
    step2: SavedQuery,
    step3: SavedQuery,
}

export const getUserActivationReport = async (query: string, userId: string) => {
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

    const funnelSteps = await prisma.funnelSteps.findMany({
        where: {
            userId: userId
        }
    });

    if(funnelSteps.length === 0 || !funnelSteps[0]) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Funnel statements not found',
                    cause: 'Please add funnel steps to your database to get your report.'
                }
            ]
        };
    }

    const timeSeries = getMonthlyTimeSeries(13);    
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const funnelTotal: ExcelCell[] = [{value: 'Total'}];

    const {
        data: usersByFunnelStep,
        query: funnelQuery,
    } = await getUserByFunnelStep(funnelSteps[0], client, embeddings, timeSeries, databaseResource.id);

    const funnelStep1: ExcelCell[] = [{value: 'Funnel Step 1', query: funnelQuery.step1}];
    const funnelStep2: ExcelCell[] = [{value: 'Funnel Step 2', query: funnelQuery.step2}];
    const funnelStep3: ExcelCell[] = [{value: 'Funnel Step 3', query: funnelQuery.step3}];

    const signedUpToStep1: ExcelCell[] = [{value: 'Signed up Step 1%'}];
    const funnelStep1toStep2: ExcelCell[] = [{value: 'Funnel Step 1 to Step 2%'}];
    const funnelStep2toStep3: ExcelCell[] = [{value: 'Funnel Step 2 to Step 3%'}];

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        if(!date) continue;
        date?.setDate(date.getDate() - 1);
        reportHeader.push({
            value: date.toDateString()
        })

        //Funnel Steps
        const funnelStep = usersByFunnelStep[i] as UsersByFunnelStep;
        if(funnelStep) {

            funnelTotal.push({ value: funnelStep?.total})
            funnelStep1.push({ value: funnelStep?.step1 });
            funnelStep2.push({ value: funnelStep?.step2 });
            funnelStep3.push({ value: funnelStep?.step3 });
            
            signedUpToStep1.push({
                value: ((funnelStep?.step1) / (funnelStep?.total) * 100).toFixed(2),
            });
            funnelStep1toStep2.push({
                value: ((funnelStep?.step2) / (funnelStep?.step1) * 100).toFixed(2),
            });
            funnelStep2toStep3.push({
                value: ((funnelStep?.step3) / (funnelStep?.step2) * 100).toFixed(2),
            });
        }
    }

    reportTable.push(reportHeader);
    reportTable.push(funnelStep1);
    reportTable.push(funnelStep2);
    reportTable.push(funnelStep3);
    reportTable.push(signedUpToStep1);
    reportTable.push(funnelStep1toStep2);
    reportTable.push(funnelStep2toStep3);

    await client.end();

    return {
        type: GET_REPORT,
        data: [
            reportTable,
            undefined
        ]
    }
}

const getUserByFunnelStep = async (
    funnelSteps:funnelSteps, 
    client:Client, 
    embeddings:ResourceSchemaEmbeddings[], 
    timeSeries: Date[],
    databaseResourceId: string,
) : Promise<{
    data: UsersByFunnelStep[],
    query: FunnelQuery
}> => {
    
    const result: UsersByFunnelStep[] = [{
        date: timeSeries[0] as Date,
        step1: 0,
        step2: 0,
        step3: 0,
        total: 0
    }];

    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");

    let queryStep1, queryStep2, queryStep3, funnelStep1SavedQuery, funnelStep2SavedQuery, funnelStep3SavedQuery;

    funnelStep1SavedQuery = await prisma.savedQuery.findFirst({
        where: {
            databaseResourceId: databaseResourceId,
            reportKey: 'Funnel Step 1'
        }
    });

    funnelStep2SavedQuery = await prisma.savedQuery.findFirst({
        where: {
            databaseResourceId: databaseResourceId,
            reportKey: 'Funnel Step 2'
        }
    });

    funnelStep3SavedQuery = await prisma.savedQuery.findFirst({
        where: {
            databaseResourceId: databaseResourceId,
            reportKey: 'Funnel Step 3'
        }
    });

    if(!funnelStep1SavedQuery) {
        queryStep1 = await processPrompt(funnelSteps.step1, client, embeddings, timeSeries);
        funnelStep1SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 1',
                query: queryStep1.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>'),
                feedback: 0
            }
        });
    } else {
        if(funnelStep1SavedQuery.feedback === 1) {
            queryStep1 = funnelStep1SavedQuery.query.replace('<DATE-1>', timeSeries0).replace('<DATE-2>', timeSeries1);
        } else {
            queryStep1 = await processPrompt(funnelSteps.step1, client, embeddings, timeSeries);
            funnelStep1SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep1SavedQuery.id
                },
                data: {
                    query: queryStep1.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>')
                }
            });
        } 
    }

    if(!funnelStep2SavedQuery) {
        queryStep2 = await processPrompt(funnelSteps.step2, client, embeddings, timeSeries);
        funnelStep2SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 2',
                query: queryStep2.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>'),
                feedback: 0
            }
        });
    } else {
        if(funnelStep2SavedQuery.feedback === 1) {
            queryStep2 = funnelStep2SavedQuery.query.replace('<DATE-1>', timeSeries0).replace('<DATE-2>', timeSeries1);
        } else {
            queryStep2 = await processPrompt(funnelSteps.step2, client, embeddings, timeSeries);
            funnelStep2SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep2SavedQuery.id
                },
                data: {
                    query: queryStep2.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>')
                }
            });
        }
    }

    if(!funnelStep3SavedQuery) {
        queryStep3 = await processPrompt(funnelSteps.step3, client, embeddings, timeSeries);
        funnelStep3SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 3',
                query: queryStep3.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>'),
                feedback: 0
            }
        });
    } else {
        if(funnelStep3SavedQuery.feedback === 1) {
            queryStep3 = funnelStep3SavedQuery.query.replace('<DATE-1>', timeSeries0).replace('<DATE-2>', timeSeries1);
        } else {
            queryStep3 = await processPrompt(funnelSteps.step3, client, embeddings, timeSeries);
            funnelStep3SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep3SavedQuery.id
                },
                data: {
                    query: queryStep3.replace(timeSeries0, '<DATE-1>').replace(timeSeries1, '<DATE-2>')
                }
            });
        }
    }
        
    const queryTotal = await processPrompt(
        'Get number of users that joined', client, embeddings, timeSeries
    )

    if(!queryStep1 || !queryStep2 || !queryStep3 ||
        !queryStep1.includes(timeSeries0) || !queryStep1.includes(timeSeries1) ||
        !queryStep2.includes(timeSeries0) || !queryStep2.includes(timeSeries1) ||
        !queryStep3.includes(timeSeries0) || !queryStep3.includes(timeSeries1) ||
        !queryTotal.includes(timeSeries0) || !queryTotal.includes(timeSeries1)) {
        return {
            data: result,
            query: {
                step1: funnelStep1SavedQuery,
                step2: funnelStep2SavedQuery,
                step3: funnelStep3SavedQuery,
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
            const sqlQueryStep1 = queryStep1.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const sqlQueryStep2 = queryStep2.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const sqlQueryStep3 = queryStep3.replace(timeSeries0, date0).replace(timeSeries1, date1);
            const sqlQueryTotal = queryTotal.replace(timeSeries0, date0).replace(timeSeries1, date1);
            let step1Count = 0;
            let step2Count = 0;
            let step3Count = 0;
            let totalCount = 0;
            try {
                const step1Result = await executeQuery(client, sqlQueryStep1);
                step1Count = step1Result[0]?.count as number;
            } catch (error) {
            }
            try {
                const step2Result = await executeQuery(client, sqlQueryStep2);
                step2Count = step2Result[0]?.count as number;
            } catch (error) {
            }
            try {
                const step3Result = await executeQuery(client, sqlQueryStep3);
                step3Count = step3Result[0]?.count as number;
            } catch (error) {
            }
            try {
                const step3Result = await executeQuery(client, sqlQueryTotal);
                totalCount = step3Result[0]?.count as number;
            } catch (error) {
            }
            result.push({
                date: timeSeries[i] as Date,
                step1: step1Count,
                step2: step2Count,
                step3: step3Count,
                total: totalCount
            })
        }
    } catch (error) {
        console.log(error);
    }

    console.log(result);
    return {
        data: result,
        query: {
            step1: funnelStep1SavedQuery,
            step2: funnelStep2SavedQuery,
            step3: funnelStep3SavedQuery,
        }
    };
}