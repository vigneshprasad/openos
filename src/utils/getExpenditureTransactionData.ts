import { type RazorpayResource } from "@prisma/client"
import axios from "axios";
import { getExpenseClassification } from "./getExpenseClassification";

type Transaction = {
    date: Date
    description: string
    amount: number
    balance?: number
    purpose?: string
    fee?: number
    tax?: number
    category: string
}

type RazorpayPayoutAPIResponse = {
    entity: string
    count: number
    items: RazorpayPayoutEntity[]    
}

type RazorpayPayoutEntity = {
    created_at: number,
    narration: string,
    amount: number,
    fees: number,
    tax: number,
    purpose: string,
}

export const getRazorpayTransactionData = async (
    razorpayResource: RazorpayResource,
): Promise<Transaction[]> => {
    
    const transactions: Transaction[] = [];
    try {
        const response = await axios.get('https://api.razorpay.com/v1/payouts', {
            params: {
                'account_number': razorpayResource.account_number
            },
            auth: {
                username: razorpayResource.key_id,
                password: razorpayResource.key_secret
            }
        });
        if(!response.data) return transactions;
        const responseData = response.data as RazorpayPayoutAPIResponse;
        const razorpayPayouts = responseData.items;
        for(const razorpayPayout of razorpayPayouts) {
            if(!razorpayPayout) continue;
            const category = await getExpenseClassification(razorpayPayout.narration);
            transactions.push({
                date: new Date(razorpayPayout.created_at * 1000 ),
                description: razorpayPayout.narration,
                amount: (razorpayPayout.amount / 100) * -1,
                purpose: razorpayPayout.purpose,
                category: category,
                fee: razorpayPayout.fees / 100,
                tax: razorpayPayout.tax / 100,
            })
        }
        return transactions;
    } catch (error) {     
        console.log(error);
        return [];
    }
}