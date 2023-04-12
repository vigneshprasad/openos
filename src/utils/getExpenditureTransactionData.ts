import { type BankStatement, type RazorpayResource } from "@prisma/client"
import moment from "moment";
import { read, utils, type WorkSheet } from 'xlsx';
import axios from "axios";

type Transaction = {
    date: Date
    description: string
    amount: number
    balance?: number
    purpose?: string
    fee?: number
    tax?: number
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

type ExcelRow = {
    [key: string]: string
}

export const getBankTransactionData = async (
    bankStatement: BankStatement
): Promise<Transaction[]> => {
    
    const transactions: Transaction[] = [];
    try {
        const f = await (await fetch(bankStatement.url)).arrayBuffer();
        const wb = read(f); 
        const ws = wb.Sheets[wb.SheetNames[0] as string]; 
        const data = utils.sheet_to_json(ws as WorkSheet);
        let dateKey = '';
        let descriptionKey = '';
        let creditKey = '';
        let debitKey = '';
        let balanceKey = '';
        let rowNumber = 0;
        let score = 0;

        for(let i = 0; i < data.length; i++) {
            const row = data[i] as ExcelRow;
            if(!row) continue;

            const keys = Object.keys(row);
            score = 0;

            for(const key of keys) {
                if(!key) continue;
                if(row[key] === 'Date' || row[key] === 'Post Date') {
                    dateKey = key;
                    score += 1;
                }
                if(row[key] === 'Narration' || row[key] === 'Account Description') {
                    descriptionKey = key;
                    score += 1;
                }
                if(row[key] === 'Deposit Amt.' || row[key] === 'Debit') {
                    debitKey = key;
                    score += 1;
                }
                if(row[key] === 'Withdrawal Amt.' || row[key] === 'Credit') {
                    creditKey = key;
                    score += 1;
                }
                if(row[key] === 'Closing Balance' || row[key] === 'Balance') {
                    balanceKey = key;
                    score += 1;
                }
            }
            if(rowNumber === 0 && score === 5) {
                rowNumber = i;
            }
        }

        if(rowNumber === 0 && score !== 5) {
            return [];
        }

        for(let j = rowNumber; j < data.length; j++) {
            const row = data[j] as ExcelRow;
            if(!row) {
                continue;
            }
            const date = typeof(row[dateKey]) === 'string' && row[dateKey]?.trim();
            if(!date) {
                continue;
            }
            const dateValue = moment(date, "DD/MM/YYYY").toDate();
            let debit, credit, balance;
            if(typeof(row[debitKey]) === 'number') {
                debit = row[debitKey];
            } else if(typeof(row[debitKey]) === 'string') {
                debit = parseFloat(row[debitKey]?.trim() as string);
            }
            if(typeof(row[creditKey]) === 'number') {
                credit = row[creditKey];
            } else if(typeof(row[creditKey]) === 'string') {
                credit = parseFloat(row[creditKey]?.trim() as string);
            }
            if(!debit && !credit) {
                continue
            }
            const amount = (debit ? debit : credit ? (credit as number) * -1 : undefined) as number;
            if(typeof(row[balanceKey]) === 'number') {
                balance = row[balanceKey];
            } else if(typeof(row[balanceKey]) === 'string') {
                balance = parseFloat(row[balanceKey]?.trim() as string);
            }
            if(!balance) {
                continue
            }
            transactions.push({
                date: dateValue,
                description: row[descriptionKey]?.trim() || 'No description',
                amount: amount,
                balance: balance as number,
            })
        }
        return transactions;
    } catch (error) {
        console.log(error);
        return [];
    }
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
            transactions.push({
                date: new Date(razorpayPayout.created_at * 1000 ),
                description: razorpayPayout.narration,
                amount: (razorpayPayout.amount / 100) * -1,
                purpose: razorpayPayout.purpose,
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