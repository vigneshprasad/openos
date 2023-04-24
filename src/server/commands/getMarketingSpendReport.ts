import { prisma } from "~/server/db";

import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { Client } from "pg";
import { getUserBySource } from "./getUserAcquisitionReport";
import { type Transaction } from "@prisma/client";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";

type UsersBySource = {
    date: Date,
    facebook: number,
    google: number,
    organic: number,
    total: number
}

type MarketingSpend = {
    date: Date,
    facebook: number,
    google: number,
}

export const getMarketingSpendReport = async (query: string, userId: string) => {
    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    const transactions = await prisma.transaction.findMany({
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
                cause: 'Please add a database resource to your account to get MIS B2C report.'
            }
        ]
    }

    if(transactions.length === 0) {
        return [
            undefined,
            {
                query: 'Request unprocessed',
                message: 'No transactions found',
                cause: 'Could not process bank statement'
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
    
    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]

    const facebookSpend: ExcelCell[] = [{value: 'Facebook Spend'}];
    const facebookCac: ExcelCell[] = [{value: 'Facebook CAC'}];
    const googleSpend: ExcelCell[] = [{value: 'Google Spend'}];
    const googleCac: ExcelCell[] = [{value: 'Google CAC'}];
    
    const {
        data: usersBySource
    } =  await getUserBySource(client, embeddings, timeSeries, databaseResource.id);
    const marketingSpents: MarketingSpend[] = getMarketingSpend(transactions, timeSeries);

    for(let i = 1; i < timeSeries.length; i++) {
        const date = timeSeries[i];
        date?.setDate(date.getDate() - 1);
        if(!date) continue;
        reportHeader.push({
            value: date.toDateString()
        })

        // Marketing Spent
        if(marketingSpents[i] && usersBySource[i]) {
            const userBySource = usersBySource[i] as UsersBySource;
            const marketingSpent = marketingSpents[i] as MarketingSpend;
            const facebookSpendNumber = marketingSpent.facebook * -1;
            const googleSpendNumber = marketingSpent.google * -1;

            facebookSpend.push({ value: facebookSpendNumber.toFixed(2) });
            facebookCac.push({
                value: ((facebookSpendNumber) / (userBySource.facebook) * 100).toFixed(2),
                unit: '₹',
                unitPrefix: true
            });

            googleSpend.push({ value: googleSpendNumber.toFixed(2) });
            googleCac.push({
                value: ((googleSpendNumber) / (userBySource.google) * 100).toFixed(2),
                unit: '₹',
                unitPrefix: true
            });
        }
    }

    reportTable.push(reportHeader);

    reportTable.push(facebookSpend);
    reportTable.push(facebookCac);
    reportTable.push(googleSpend);
    reportTable.push(googleCac);

    await client.end();

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );


    return [
        {
            heading: 'Marketing Spend',
            sheet: reportTableWithProjections
        },
        undefined
    ]
}

const getMarketingSpend = (transactions:Transaction[], timeSeries: Date[]) : MarketingSpend[] => {
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
        ).reduce((acc, transaction) => acc + transaction.amount.toNumber(), 0);
        const googleSpent = googleTransactions.filter(
            transaction => transaction.date >= prevDate && transaction.date < date
        ).reduce((acc, transaction) => acc + transaction.amount.toNumber(), 0);
        result.push({
            date: timeSeries[i] as Date,
            facebook: facebookSpent,
            google: googleSpent,
        });
    }

    return result;
        
}