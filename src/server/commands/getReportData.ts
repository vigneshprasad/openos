import { prisma } from "~/server/db";

import { DATABASE_QUERY, GET_DATA, GET_REPORT } from "~/constants/commandConstants";
import Razorpay from "razorpay";
import { type DateRange, getDateRangeFromString } from "~/utils/getDateRangeFromString";
import { type CustomerDetails, getCustomerFromString } from "~/utils/getCustomerFromStrings";
import { getOrderIdFromString } from "~/utils/getOrderIdFromString";
import { getEntityFromString } from "~/utils/getEntityFromString";
import { type Orders } from "razorpay/dist/types/orders";

type Customer = {
    id: string;
    name?: string;
    email: string;
    phone: string;  
    amount: number;
}


export const getReportData = async (query: string, userId: string) => {
    const razorpayResources = await prisma.razorpayResource.findMany({
        where: {
            userId: userId
        }
    })
    const razorpayResource = razorpayResources[0];
    if(!razorpayResources || !razorpayResource) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'No Razorpay resource found',
                    cause: 'Please add a Razorpay resource to your account to run queries.'
                }
            ]
        };
    }

    const databaseResources = await prisma.databaseResource.findMany({
        where: {
            userId: userId
        }
    })
    
    const databaseResource = databaseResources[0];
    if(!databaseResources || !databaseResource) {
        return {
            type: GET_REPORT,
            data: [
                undefined, 
                {
                    query: 'Query unprocessed',
                    message: 'No database resource found',
                    cause: 'Please add a database resource to your account to run queries.'
                }
            ]
        };
    }

    const dbUrl = `postgresql://${databaseResource?.username}:${databaseResource?.password}@${databaseResource?.host}:${databaseResource?.port}/${databaseResource?.dbName}?sslmode=require`;

}