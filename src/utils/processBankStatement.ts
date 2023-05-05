import { type Transaction, type BankStatement, Prisma } from "@prisma/client"
import moment from "moment";
import { read, utils, type WorkSheet } from 'xlsx';
import { getExpenseClassification } from "./getExpenseClassification";
import { prisma } from "~/server/db";


type ExcelRow = {
    [key: string]: string
}

type TransactionPrototype = {
    date: Date,
    description: string,
    balance: Prisma.Decimal,
    amount: Prisma.Decimal,
    category: string,
    bankStatementId: string,
    userId: string,
}


export const processBankStatement = async (
    bankStatement: BankStatement,
    userId: string,
    bankStatementId: string
): Promise<Transaction[]> => {
    
    const transactions: TransactionPrototype[] = [];
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
                if(row[key] === 'Date' || row[key] === 'Post Date' || row[key] === 'Txn Date') {
                    dateKey = key;
                    score += 1;
                }
                if(row[key] === 'Narration' || row[key] === 'Account Description' ||  row[key]=== 'Description') {
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
            const previousTransaction = await prisma.transaction.findFirst({
                where: {
                    description: row[descriptionKey]?.trim(),
                }
            });
            let category;
            if(previousTransaction) {
                category = previousTransaction.category;
            } else {
                 category = await getExpenseClassification(row[descriptionKey]?.trim() || 'No description');
            }
            console.log(row[descriptionKey]?.trim(), category);
            transactions.push({
                date: dateValue,
                description: row[descriptionKey]?.trim() || 'No description',
                amount: new Prisma.Decimal(amount),
                balance: new Prisma.Decimal(balance),
                category: category,
                userId: userId,
                bankStatementId: bankStatementId
            });
        }

        const result =await prisma.transaction.createMany({
            data: transactions,
            skipDuplicates: true
        });

        if(result.count > 0) {
            return await prisma.transaction.findMany({
                where: {
                    bankStatementId: bankStatementId
                }
            });
        }
        return [];

    }
    catch(err) {
        console.log(err);
        return [];
    }
}