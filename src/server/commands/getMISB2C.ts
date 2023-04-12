import { prisma } from "~/server/db";

import { GET_REPORT } from "~/constants/commandConstants";
import { getBankTransactionData } from "~/utils/getExpenditureTransactionData";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { type ResourceSchemaEmbeddings, type funnelSteps } from "@prisma/client";
import { Client, type QueryResult } from "pg";
import { createContext } from "~/utils/createContext";
import { openai } from "../services/openai";
import { COMPLETIONS_MODEL } from "~/constants/openAi";

import { type TableRow } from "~/types/types";
import moment from "moment";

type Transaction = {
    date: Date
    description: string
    amount: number
    balance?: number
    purpose?: string
    fee?: number
    tax?: number
}

type UsersBySource = {
    date: Date,
    facebook: number,
    google: number,
    organic: number,
    total: number
}

type UsersByFunnelStep = {
    date: Date,
    step1: number,
    step2: number,
    step3: number,
}

type ActiveUsers = {
    date: Date,
    dau: number,
    wau: number,
    mau: number,
}

type MarketingSpent = {
    date: Date,
    facebook: number,
    google: number,
}

type RetentionData = {
    date: Date,
    d0: number,
    d1: number,
    d7: number,
    d14: number,
    d30: number,
}

export const getMISB2C = async (query: string, userId: string) => {
    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    const bankStatements = await prisma.bankStatement.findMany({
        where: {
            userId: userId
        }
    })

    const databaseResource = databaseResources[0];
    const bankStatement = bankStatements[bankStatements.length - 1];
    if(!databaseResource || !bankStatement) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Database not found',
                    cause: 'Please add a database resource to your account to get MIS B2C report.'
                }
            ]
        };
    }
    if(!databaseResource || !bankStatement) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Bank statement not found found',
                    cause: 'Please add a bank stament to your account to get MIS B2C report.'
                }
            ]
        };
    }
    const transactions = await getBankTransactionData(bankStatement);
    if(transactions.length === 0) {
        return {
            type: GET_REPORT,
            data: [
                undefined,
                {
                    query: 'Request unprocessed',
                    message: 'No transactions found',
                    cause: 'Could not process bank statement'
                }
            ]
        }
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

    const activityDescription = await prisma.activityDescription.findUnique({
        where: {
            userId: userId
        }
    })

    if(funnelSteps.length === 0 || !funnelSteps[0]) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Funnel statements not found',
                    cause: 'Please add funnel steps to your database to get MIS B2C report.'
                }
            ]
        };
    }

    if(!activityDescription) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'User activity description not found',
                    cause: 'Please add user activity to your database to get MIS B2C report.'
                }
            ]
        };
    }

    const timeSeries = getMonthlyTimeSeries(13);    
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const organicAcquisition: ExcelCell[] = [{value: 'Organic Acquisition'}];
    const organicAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const facebookAcquisition: ExcelCell[] = [{value: 'Facebook Acquisition'}];
    const facebookAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const googleAcquisition: ExcelCell[] = [{value: 'Google Acquisition'}];
    const googleAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const otherAcquisition: ExcelCell[] = [{value: 'Other Acquisition'}];
    const otherAcquisitionGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const totalAcquisition: ExcelCell[] = [{value: 'Total Acquisition'}];
    const percentOrganicUsers: ExcelCell[] = [{value: 'Organic as a % of total'}];

    const funnelStep1: ExcelCell[] = [{value: 'Funnel Step 1'}];
    const funnelStep2: ExcelCell[] = [{value: 'Funnel Step 2'}];
    const funnelStep3: ExcelCell[] = [{value: 'Funnel Step 3'}];

    const signedUpToStep1: ExcelCell[] = [{value: 'Signed up Step 1%'}];
    const funnelStep1toStep2: ExcelCell[] = [{value: 'Funnel Step 1 to Step 2%'}];
    const funnelStep2toStep3: ExcelCell[] = [{value: 'Funnel Step 2 to Step 3%'}];

    const dailyActiveUsers: ExcelCell[] = [{value: 'Daily Active Users (DAUs)'}];
    const dailyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const weeklyActiveUsers: ExcelCell[] = [{value: 'Weekly Active Users (WAUs)'}];
    const weeklyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];
    const monthlyActiveUsers: ExcelCell[] = [{value: 'Monthly Active Users (MAUs)'}];
    const monthlyActiveUsersGrowth: ExcelCell[] = [{value: 'Growth %'}];

    const d0Retention: ExcelCell[] = [{value: 'D0 Retention'}];
    const d1Retention: ExcelCell[] = [{value: 'D1 Retention'}];
    const d7Retention: ExcelCell[] = [{value: 'D7 Retention'}];
    const d14Retention: ExcelCell[] = [{value: 'D14 Retention'}];
    const d30Retention: ExcelCell[] = [{value: 'D30 Retention'}];

    const facebookSpend: ExcelCell[] = [{value: 'Facebook Spend'}];
    const facebookCac: ExcelCell[] = [{value: 'Facebook CAC'}];
    const googleSpend: ExcelCell[] = [{value: 'Google Spend'}];
    const googleCac: ExcelCell[] = [{value: 'Google CAC'}];
    
    const usersBySource:UsersBySource[] =  await getUserBySource(client, embeddings, timeSeries);
    const usersByFunnelStep: UsersByFunnelStep[] = await getUserByFunnelStep(funnelSteps[0], client, embeddings, timeSeries);

    const activityString = `Number of distinct users with ${activityDescription.activity}`;
    const activityPrompt = await processPrompt(activityString, client, embeddings, timeSeries);
    const activeUsers: ActiveUsers[] = await getActiveUsers(client, embeddings, timeSeries, activityPrompt);

    const retentionData = await getRetentionData(client, embeddings, timeSeries, activityDescription.activity);

    const marketingSpents: MarketingSpent[] = getMarketingSpent(transactions, timeSeries);

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
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
            })
            googleAcquisition.push({value: userBySource.google});
            googleAcquisitionGrowth.push({
                value: ((userBySource?.google - prevUserBySource.google) / (prevUserBySource.google) * 100).toFixed(2),
            })
            organicAcquisition.push({value: userBySource.organic});
            organicAcquisitionGrowth.push({
                value: ((userBySource?.organic - prevUserBySource.organic) / (prevUserBySource.organic) * 100).toFixed(2),
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
            });
            totalAcquisition.push({value: usersBySource[i]?.total as number});
            percentOrganicUsers.push({
                value: ((userBySource?.organic) / (userBySource.total) * 100).toFixed(2),
            });
        }

        //Funnel Steps
        const funnelStep = usersByFunnelStep[i] as UsersByFunnelStep;
        if(funnelStep) {
            const userBySource = usersBySource[i] as UsersBySource;

            funnelStep1.push({ value: funnelStep?.step1 });
            funnelStep2.push({ value: funnelStep?.step2 });
            funnelStep3.push({ value: funnelStep?.step3 });
            
            signedUpToStep1.push({
                value: ((funnelStep?.step1) / (userBySource.total) * 100).toFixed(2),
            });
            funnelStep1toStep2.push({
                value: ((funnelStep?.step2) / (funnelStep?.step1) * 100).toFixed(2),
            });
            funnelStep2toStep3.push({
                value: ((funnelStep?.step3) / (funnelStep?.step2) * 100).toFixed(2),
            });
        }

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

        // Retention
        if(retentionData[i]) {
            const retentionDataPerMonth = retentionData[i] as RetentionData;

            d0Retention.push({ value: retentionDataPerMonth.d0.toFixed(2) });
            d1Retention.push({ value: retentionDataPerMonth.d1.toFixed(2) });
            d7Retention.push({ value: retentionDataPerMonth.d7.toFixed(2) });
            d14Retention.push({ value: retentionDataPerMonth.d14.toFixed(2) });
            d30Retention.push({ value: retentionDataPerMonth.d30.toFixed(2) });

        }

        // Marketing Spent
        if(marketingSpents[i] && usersBySource[i]) {
            const userBySource = usersBySource[i] as UsersBySource;
            const marketingSpent = marketingSpents[i] as MarketingSpent;
            const facebookSpendNumber = marketingSpent.facebook * -1;
            const googleSpendNumber = marketingSpent.google * -1;

            facebookSpend.push({ value: facebookSpendNumber });
            facebookCac.push({
                value: ((facebookSpendNumber) / (userBySource.facebook) * 100).toFixed(2),
            });

            googleSpend.push({ value: googleSpendNumber });
            googleCac.push({
                value: ((googleSpendNumber) / (userBySource.google) * 100).toFixed(2),
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

    reportTable.push(funnelStep1);
    reportTable.push(funnelStep2);
    reportTable.push(funnelStep3);
    reportTable.push(signedUpToStep1);
    reportTable.push(funnelStep1toStep2);
    reportTable.push(funnelStep2toStep3);
    reportTable.push(dailyActiveUsers);
    reportTable.push(dailyActiveUsersGrowth);
    reportTable.push(weeklyActiveUsers);
    reportTable.push(weeklyActiveUsersGrowth);
    reportTable.push(monthlyActiveUsers);
    reportTable.push(monthlyActiveUsersGrowth);
    reportTable.push(d0Retention);
    reportTable.push(d1Retention);
    reportTable.push(d7Retention);
    reportTable.push(d14Retention);
    reportTable.push(d30Retention);

    reportTable.push(facebookSpend);
    reportTable.push(facebookCac);
    reportTable.push(googleSpend);
    reportTable.push(googleCac);

    await client.end();

    return {
        type: GET_REPORT,
        data: [
            reportTable,
            undefined
        ]
    }
}


const getQuery = async (client:Client, embeddings:ResourceSchemaEmbeddings[], query: string) : Promise<string> => {
           
    let prompt = "### Postgres SQL table with their properties\n#\n";
    const schemaString = await createContext(
        query,
        embeddings,
        800
    )
    prompt += schemaString;
    const newPrompt = prompt + `### A query to get ${query}\nSELECT`;
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
            prompt: newPrompt,
            temperature: 0.7,
            max_tokens: 256,
            stop: ["#", ";"]
    });        
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text;
        if(text) {
            const sqlQuery = "SELECT" + text;
            return sqlQuery;
        }
    }
    return '';
}

const executeQuery = async (client:Client, sqlQuery: string) : Promise<TableRow[]> => {
    const res: QueryResult<TableRow> = await client.query<TableRow>(
        sqlQuery
    )

    if(res.rows.length > 0) {
        return res.rows
    }
    return [];
}

const processPrompt = async (query: string, client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[]): Promise<string> => {
    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");

    const prompt = query + ` from ${timeSeries0} to ${timeSeries1}`
    const sqlQuery = await getQuery(client, embeddings, prompt);
    return sqlQuery;
}

const getUserBySource = async (client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[]) : Promise<UsersBySource[]> => {
    
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
        return []
    }
    if(!fbSqlQuery.includes(timeSeries0) || !googleSqlQuery.includes(timeSeries1) || !totalSqlQuery.includes(timeSeries0) || !organicSqlQuery.includes(timeSeries0)
        || !fbSqlQuery.includes(timeSeries1) || !googleSqlQuery.includes(timeSeries1) || !totalSqlQuery.includes(timeSeries1) || !organicSqlQuery.includes(timeSeries1)) {
            return [];
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

    console.log(userBySource);
    return userBySource;
}

const getUserByFunnelStep = async (funnelSteps:funnelSteps, client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[]) : Promise<UsersByFunnelStep[]> => {
    
    const result: UsersByFunnelStep[] = [{
        date: timeSeries[0] as Date,
        step1: 0,
        step2: 0,
        step3: 0,
    }];

    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");

    const queryStep1 = await processPrompt(funnelSteps.step1, client, embeddings, timeSeries);
    const queryStep2 = await processPrompt(funnelSteps.step2, client, embeddings, timeSeries);
    const queryStep3 = await processPrompt(funnelSteps.step3, client, embeddings, timeSeries);

    console.log(queryStep1);
    console.log("-----------")
    console.log(queryStep2);
    console.log("-----------")
    console.log(queryStep3);
    console.log("-----------");

    if(!queryStep1 || !queryStep2 || !queryStep3 ||
        !queryStep1.includes(timeSeries0) || !queryStep1.includes(timeSeries1) ||
        !queryStep2.includes(timeSeries0) || !queryStep2.includes(timeSeries1) ||
        !queryStep3.includes(timeSeries0) || !queryStep3.includes(timeSeries1)) {
        return [];
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
    return result;
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

const getMarketingSpent = (transactions:Transaction[], timeSeries: Date[]) : MarketingSpent[] => {
    const result = [
        {
            date: timeSeries[0] as Date,
            facebook: 0,
            google: 0,
        }
    ]

    const facebookTransactions = transactions.filter(
        transaction => transaction.description.toLowerCase().includes('facebook')
    );
    const googleTransactions = transactions.filter(
        transaction => transaction.description.toLowerCase().includes('googleads')
    );

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        const prevDate = timeSeries[i - 1];
        if(!date || !prevDate) continue
        const facebookSpent = facebookTransactions.filter(
            transaction => transaction.date >= prevDate && transaction.date < date
        ).reduce((acc, transaction) => acc + transaction.amount, 0);
        const googleSpent = googleTransactions.filter(
            transaction => transaction.date >= prevDate && transaction.date < date
        ).reduce((acc, transaction) => acc + transaction.amount, 0);
        result.push({
            date: timeSeries[i] as Date,
            facebook: facebookSpent,
            google: googleSpent,
        });
    }

    return result;
        
}

const getRetentionData = async (client:Client, embeddings:ResourceSchemaEmbeddings[], timeSeries: Date[], activityDescription: string) : Promise<RetentionData[]> => {
    const result = [
        {
            date: timeSeries[0] as Date,
            d0: 0,
            d1: 0,
            d7: 0,
            d14: 0,
            d30: 0,
        }
    ]

    const timeSeries0 = moment(timeSeries[0]).format("YYYY-MM-DD");
    const timeSeries1 = moment(timeSeries[1]).format("YYYY-MM-DD");
    const dummyIdentifier = "+91123412341234"

    const userListQuery = await processPrompt(
        `Get usernames and date joined of users that joined between ${timeSeries0} and ${timeSeries1}`,
        client, embeddings, timeSeries
    );

    const userList = await executeQuery(client, userListQuery);


    let activityQuery = await processPrompt(
        `${activityDescription} by user with username ${dummyIdentifier} between ${timeSeries0} and ${timeSeries1}`,
        client, embeddings, timeSeries
    );

    // TODO: This is only required for Crater - Replace id with uuid
    activityQuery = activityQuery.replace('\n', ' ');
    activityQuery = activityQuery.replace('id FROM users', 'uuid FROM users');

    console.log(userListQuery);
    console.log("-------------");
    console.log(activityQuery);

    const identifierKey = Object.keys(userList[0] as object)[0];
    const dateJoinedKey = Object.keys(userList[0] as object)[1];
    
    if(!userListQuery || !userListQuery.includes(timeSeries0) || !userListQuery.includes(timeSeries1) 
        || !dateJoinedKey ||!identifierKey || !activityQuery || !activityQuery.includes(timeSeries0) || !activityQuery.includes(timeSeries1)) {
        return [];
    }


    for(let i = 1; i < timeSeries.length; i++) {
        if(!timeSeries[i] || !timeSeries[i - 1])  {
            continue;
        }
        const date0 = moment(timeSeries[i - 1]).format('YYYY-MM-DD');
        const date1 = moment(timeSeries[i]).format('YYYY-MM-DD');

        const userListQueryNew = userListQuery.replace(timeSeries0, date0).replace(timeSeries1, date1);
        const userList = await executeQuery(client, userListQueryNew);

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
            const d7End = moment(dateJoined).add(8, 'days').format("YYYY-MM-DD");
            const d14End = moment(dateJoined).add(15, 'days').format("YYYY-MM-DD");
            const d30End = moment(dateJoined).add(31, 'days').format("YYYY-MM-DD");

            const activityQueryD0 = activityQuery.replace(timeSeries0, start).replace(timeSeries1, d0End).replace(dummyIdentifier, identifier);
            const activityQueryD1 = activityQuery.replace(timeSeries0, d0End).replace(timeSeries1, d1End).replace(dummyIdentifier, identifier);
            const activityQueryD7 = activityQuery.replace(timeSeries0, start).replace(timeSeries1, d7End).replace(dummyIdentifier, identifier);
            const activityQueryD14 = activityQuery.replace(timeSeries0, start).replace(timeSeries1, d14End).replace(dummyIdentifier, identifier);
            const activityQueryD30 = activityQuery.replace(timeSeries0, start).replace(timeSeries1, d30End).replace(dummyIdentifier, identifier);

            try {
                const activityCountD0 = await executeQuery(client, activityQueryD0);
                const activityCountD1 = await executeQuery(client, activityQueryD1);
                const activityCountD7 = await executeQuery(client, activityQueryD7);
                const activityCountD14 = await executeQuery(client, activityQueryD14);
                const activityCountD30 = await executeQuery(client, activityQueryD30);

                if(activityCountD0.length > 0) d0Count++;
                if(activityCountD1.length > 0) d1Count++;
                if(activityCountD7.length > 0) d7Count++;
                if(activityCountD14.length > 0) d14Count++;
                if(activityCountD30.length > 0) d30Count++;

            } catch(e) {
                console.log(e);
                continue;
            }

            
        }

        result.push({
            date: timeSeries[i] as Date,
            d0: d0Count / userList.length,
            d1: d1Count / userList.length,
            d7: d7Count / userList.length,
            d14: d14Count / userList.length,
            d30: d30Count / userList.length,
        });
    }

    return result;
};



