import { prisma } from "~/server/db";

import { GET_DATA } from "~/constants/commandConstants";
import { getTransactionDataFromExcel } from "~/utils/getTransactionDataFromExcel";
import { type RazorpayResource } from "@prisma/client";


type IncomeData = {
    subscriptionRevenue: number;
    transactionRevenue: number;
    otherRevenue: number;
    totalIncome: number;
    costOfGoodsSold: number;
    vendorPayout: number;
    transactionFee: number;
    customerSupport: number;
    hosting: number;
}

type Transaction = {
    date: Date
    description: string
    amount: number
}

type ExpenditureBreakdown = {
    [key: string]: number
}


export const getFinancialReport = async (query: string, userId: string) => {
    const razorpayResources = await prisma.razorpayResource.findMany({
        where: {
            userId: userId
        }
    })
    const bankStatements = await prisma.bankStatement.findMany({
        where: {
            userId: userId
        }
    })


    const razorpayResource = razorpayResources[0];
    const bankStatement = bankStatements[0];
    if(!razorpayResource || !bankStatement) {
        return {
            type: GET_DATA,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'No financial resource found',
                    cause: 'Please add a Razorpay resource or a bank stament to your account to get financial report.'
                }
            ]
        };
    }

    const transactions = await getTransactionDataFromExcel(razorpayResource, bankStatement);
    // const incomeData = await getIncomeData(razorpayResource);


}


// const getIncomeData = (razorpayResource: RazorpayResource) : Promise<IncomeData> => {

// }

// const getExpenditureBreakdown = (transactionData: Transaction[]) : Promise<ExpenditureBreakdown> => {

// }



