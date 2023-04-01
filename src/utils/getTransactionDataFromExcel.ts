import { type BankStatement, type RazorpayResource } from "@prisma/client"
import { read, utils, type WorkSheet } from 'xlsx';


type Transaction = {
    date: Date
    description: string
    amount: number
}

export const getTransactionDataFromExcel = async (
    razorpayResource: RazorpayResource | undefined,
    bankStatement: BankStatement
): Promise<Transaction[]> => {
    
    const transactions: Transaction[] = [];
    try {
        const f = await (await fetch(bankStatement.url)).arrayBuffer();
        const wb = read(f); 
        const ws = wb.Sheets[wb.SheetNames[0] as string]; 
        const data = utils.sheet_to_json(ws as WorkSheet);
        console.log(data);
    } catch (error) {
        throw(error);
    }
    
    return transactions;
}