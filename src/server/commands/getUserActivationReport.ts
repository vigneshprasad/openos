import { prisma } from "~/server/db";

import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type SavedQuery, type ResourceSchemaEmbeddings, type funnelSteps } from "@prisma/client";
import { Client } from "pg";

import moment from "moment";
import { processPrompt } from "~/utils/processPrompt";
import { executeQuery } from "~/utils/executeQuery";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";

type UsersByFunnelStep = {
    date: Date,
    step1: number,
    step2: number,
    step3: number,
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
        return [
            undefined, 
            {
                query: 'Request unprocessed',
                message: 'Database not found',
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

    const funnelSteps = await prisma.funnelSteps.findMany({
        where: {
            userId: userId
        }
    });

    if(funnelSteps.length === 0 || !funnelSteps[0]) {
        return [
            undefined, 
            {
                query: 'Request unprocessed',
                message: 'Funnel statements not found',
                cause: 'Please add funnel steps to your database to get your report.'
            }
        ]
    }

    const timeSeries = getMonthlyTimeSeries(13);    
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const {
        data: usersByFunnelStep,
        query: funnelQuery,
    } = await getUserByFunnelStep(funnelSteps[0], client, embeddings, timeSeries, databaseResource.id);

    const funnelStep1: ExcelCell[] = [{value: 'Funnel Step 1', query: funnelQuery.step1}];
    const funnelStep2: ExcelCell[] = [{value: 'Funnel Step 2', query: funnelQuery.step2}];
    const funnelStep3: ExcelCell[] = [{value: 'Funnel Step 3', query: funnelQuery.step3}];

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
            funnelStep1.push({ value: funnelStep?.step1 });
            funnelStep2.push({ value: funnelStep?.step2 });
            funnelStep3.push({ value: funnelStep?.step3 });
            
            funnelStep1toStep2.push({
                value: ((funnelStep?.step2) / (funnelStep?.step1) * 100).toFixed(2),
                unit: '%'
            });
            funnelStep2toStep3.push({
                value: ((funnelStep?.step3) / (funnelStep?.step2) * 100).toFixed(2),
                unit: '%'
            });
        }
    }

    reportTable.push(reportHeader);
    reportTable.push(funnelStep1);
    reportTable.push(funnelStep2);
    reportTable.push(funnelStep3);
    reportTable.push(funnelStep1toStep2);
    reportTable.push(funnelStep2toStep3);

    await client.end();

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );

    return [
        {
            heading: 'User Activation',
            sheet: reportTableWithProjections
        },
        undefined
    ]
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
        queryStep1 = await processPrompt(
            `Get the number of users who signed up from ${timeSeries0} to ${timeSeries1} using the users table.
            Using those users find out who has taken the action - ${funnelSteps.step1}`,
            client, 
            embeddings, 
            timeSeries,
            databaseResourceId, 
            true
        );
        queryStep1 = queryStep1.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
        funnelStep1SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 1',
                query: queryStep1,
                feedback: 0
            }
        });
    } else {
        if(funnelStep1SavedQuery.feedback === 1) {
            queryStep1 = funnelStep1SavedQuery.query
        } else {
            queryStep1 = await processPrompt(
                `Get the number of users who signed up from ${timeSeries0} to ${timeSeries1} using the users table.
                Using those users find out who has taken the action - ${funnelSteps.step1}`,
                client, 
                embeddings, 
                timeSeries,
                databaseResourceId,
                true
            );
            queryStep1 = queryStep1.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
            funnelStep1SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep1SavedQuery.id
                },
                data: {
                    query: queryStep1
                }
            });
        } 
    }

    if(!funnelStep2SavedQuery) {
        queryStep2 = await processPrompt(
            `Number of users who joined from ${timeSeries0} to ${timeSeries1} who have ${funnelSteps.step2}`,
            client, 
            embeddings, 
            timeSeries,
            databaseResourceId,
            true
        );
        queryStep2 = queryStep2.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
        funnelStep2SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 2',
                query: queryStep2,
                feedback: 0
            }
        });
    } else {
        if(funnelStep2SavedQuery.feedback === 1) {
            queryStep2 = funnelStep2SavedQuery.query
        } else {
            queryStep2 = await processPrompt(
                `Number of users who joined from ${timeSeries0} to ${timeSeries1} who have ${funnelSteps.step2}`,
                client, 
                embeddings, 
                timeSeries,
                databaseResourceId,
                true
            );
            queryStep2 = queryStep2.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
            funnelStep2SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep2SavedQuery.id
                },
                data: {
                    query: queryStep2,
                }
            });
        }
    }

    if(!funnelStep3SavedQuery) {
        queryStep3 = await processPrompt(
            `Number of users who joined from ${timeSeries0} to ${timeSeries1} who have ${funnelSteps.step3}`,
            client, 
            embeddings, 
            timeSeries,
            databaseResourceId,
        );
        queryStep3 = queryStep3.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
        funnelStep3SavedQuery = await prisma.savedQuery.create({
            data: {
                databaseResourceId: databaseResourceId,
                reportKey: 'Funnel Step 3',
                query: queryStep3,
                feedback: 0
            }
        });
    } else {
        if(funnelStep3SavedQuery.feedback === 1) {
            queryStep3 = funnelStep3SavedQuery.query
        } else {
            queryStep3 = await processPrompt(
                `Number of users who joined from ${timeSeries0} to ${timeSeries1} who have ${funnelSteps.step3}`,
                client, 
                embeddings, 
                timeSeries,
                databaseResourceId,
            );
            queryStep3 = queryStep3.replaceAll(timeSeries0, '<DATE-1>').replaceAll(timeSeries1, '<DATE-2>')
            funnelStep3SavedQuery = await prisma.savedQuery.update({
                where: {
                    id: funnelStep3SavedQuery.id
                },
                data: {
                    query: queryStep3 
                }
            });
        }
    }

    if(!queryStep1 || !queryStep2 || !queryStep3 ||
        !queryStep1.includes('<DATE-1>') || !queryStep1.includes('<DATE-2>') ||
        !queryStep2.includes('<DATE-1>') || !queryStep2.includes('<DATE-2>') ||
        !queryStep3.includes('<DATE-1>') || !queryStep3.includes('<DATE-2>')) {
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
            const sqlQueryStep1 = queryStep1.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
            const sqlQueryStep2 = queryStep2.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
            const sqlQueryStep3 = queryStep3.replaceAll('<DATE-1>', date0).replaceAll('<DATE-2>', date1);
            let step1Count = 0;
            let step2Count = 0;
            let step3Count = 0;
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
            result.push({
                date: timeSeries[i] as Date,
                step1: step1Count,
                step2: step2Count,
                step3: step3Count,
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