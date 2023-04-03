import { prisma } from "~/server/db";

import { GET_DATA, GET_FINANCIAL_REPORT } from "~/constants/commandConstants";
import { getBankTransactionData, getRazorpayTransactionData } from "~/utils/getExpenditureTransactionData";
import { getExpenseClassification } from "~/utils/getExpenseClassification";
import { type RazorpayResource } from "@prisma/client";
import Razorpay from "razorpay";
import axios from "axios";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";

type IncomeData = {
    subscriptionRevenue: Transaction[]; 
    transactionRevenue: Transaction[]; 
    otherRevenue: Transaction[]; 
    totalIncome: Transaction[]; 
    vendorPayout: Transaction[]; 
    transactionFee: Transaction[];
}

type Transaction = {
    date: Date
    description: string
    amount: number
    balance?: number
    purpose?: string
    fee?: number
    tax?: number
}

type ExpenditureBreakdown = {
    "Marketing Expenses": Transaction[],
    "Contractors" : Transaction[],
    "Professional Services" : Transaction[],
    "Salaries and Wages" : Transaction[],
    "Payroll Taxes" : Transaction[],
    "Other Payroll Expenses" : Transaction[],
    "Tax Expenses" : Transaction[],
    "Insurance" : Transaction[],
    "Subscriptions" : Transaction[],
    "Other Expenses" : Transaction[],
    "Food and Drinks" : Transaction[],
    "Office Supplies" : Transaction[],
    "Office Space" : Transaction[],
    "Hosting" : Transaction[],
}

type RazorpayTransactionAPIResponse = {
    entity: string
    count: number
    items: RazorpayTransactionEntity[]    
}

type RazorpayTransactionEntity = {
    created_at: number,
    debit: number,
    credit: number,
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
    const bankStatement = bankStatements[bankStatements.length - 1];
    if(!bankStatement) {
        return {
            type: GET_DATA,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'No bank statement found',
                    cause: 'Please add a bank stament to your account to get financial report.'
                }
            ]
        };
    }
    const bankTransactions = await getBankTransactionData(bankStatement);
    let transactions = [...bankTransactions];
    let razorpayTransactions:Transaction[] = []
    if(razorpayResource) {
        razorpayTransactions = await getRazorpayTransactionData(razorpayResource);
        transactions = [...bankTransactions, ...razorpayTransactions];
    }
    if(transactions.length === 0) {
        return {
            type: GET_DATA,
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

    const timeSeries = getMonthlyTimeSeries(12);

    // const breakdown = await getExpenditureBreakdown(transactions);
    const incomeData = await getIncomeData(razorpayResource, transactions);

    const reportTable: ExcelCell[][] = [];
    const reportHeader: ExcelCell[] = [{value: 'Name'}]
    const bankBalance: ExcelCell[] = [{value: 'Bank Balance'}];
    const bankBalanceGrowthPercent: ExcelCell[] = [{value: 'Growth %'}];
    const razorpayBalance: ExcelCell[] = [{value: 'RazorPay Balance'}];
    const razorpayBalanceGrowthPercent: ExcelCell[] = [{value: 'Growth %'}];
    const subscriptionRevenue: ExcelCell[] = [{value: 'Subscription Revenue'}];
    const transactionRevenue: ExcelCell[] = [{value: 'Transaction Revenue'}];
    const otherRevenue: ExcelCell[] = [{value: 'Other Revenue'}];
    const totalIncome: ExcelCell[] = [{value: 'Total Income'}];

    for(let i = 0; i < timeSeries.length; i++) {
        const time = timeSeries[i];
        if(!time) continue;
        reportHeader.push({
            value: time.toDateString()
        })
        bankBalance.push({
            value: getBalanceByDate(bankTransactions, time)
        });
        razorpayBalance.push({
            value: getBalanceByDate(razorpayTransactions, time)
        });
        if(i == 0) {
            bankBalanceGrowthPercent.push({
                value: 0
            });
            razorpayBalanceGrowthPercent.push({
                value: 0
            });
            subscriptionRevenue.push({
                value: 0
            });
            transactionRevenue.push({
                value: 0
            });
            otherRevenue.push({
                value: 0
            });
            totalIncome.push({
                value: 0
            });
            continue;
        }
        bankBalanceGrowthPercent.push({
            value: ((bankBalance[i+1]?.value as number) / (bankBalance[i]?.value as number) * 100).toFixed(2),
            expression: `=${String.fromCharCode(65 + i + 1)}1/${String.fromCharCode(65 + i)}1 * 100`
        });
        razorpayBalanceGrowthPercent.push({
            value: ((razorpayBalance[i+1]?.value as number) / (razorpayBalance[i]?.value as number) * 100).toFixed(2),
            expression: `=${String.fromCharCode(65 + i + 1)}1/${String.fromCharCode(65 + i)}1 * 100`
        });
        const prevTime = timeSeries[i - 1];
        if(!prevTime) continue;
        const filteredSubscriptions = incomeData.subscriptionRevenue.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        //SUBSCRIPTION REVENUE
        let subscriptionRevenueAmount = 0;
        for(const subscription of filteredSubscriptions) {
            subscriptionRevenueAmount += subscription.amount;
        }
        subscriptionRevenue.push({
            value: subscriptionRevenueAmount
        })

        //TRANSACTION REVENUE
        const filteredTransactionRevenue = incomeData.transactionRevenue.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let transactionRevenueAmount = 0;
        for(const transaction of filteredTransactionRevenue) {
            transactionRevenueAmount+= transaction.amount;
        }
        transactionRevenue.push({
            value: transactionRevenueAmount
        })

        //OTHER REVENUE
        const filteredOtherRevenue = incomeData.otherRevenue.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let otherRevenueAmount = 0;
        for(const transaction of filteredOtherRevenue) {
            otherRevenueAmount+= transaction.amount;
        }
        otherRevenue.push({
            value: otherRevenueAmount
        })

        //TOTAL INCOME
        const totalRevenue = incomeData.totalIncome.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let totalRevenueAmount = 0;
        for(const transaction of totalRevenue) {
            totalRevenueAmount+= transaction.amount;
        }
        totalIncome.push({
            value: totalRevenueAmount
        })


    }
    reportTable.push(reportHeader);
    reportTable.push(bankBalance);
    reportTable.push(bankBalanceGrowthPercent);
    reportTable.push(razorpayBalance);
    reportTable.push(razorpayBalanceGrowthPercent);
    reportTable.push(subscriptionRevenue);
    reportTable.push(transactionRevenue);
    reportTable.push(otherRevenue);
    reportTable.push(totalIncome);

    return {
        type: GET_FINANCIAL_REPORT,
        data: [
            reportTable,
            undefined
        ]
    }
}

//@TODO: ERROR HANDLING FOR THIS FUNCTION
const getIncomeData = async (razorpayResource: RazorpayResource | undefined, transactionData: Transaction[]) : Promise<IncomeData> => {
    const incomeData: IncomeData = {
        subscriptionRevenue: [],
        transactionRevenue: [],
        otherRevenue: [],
        totalIncome: [],
        vendorPayout: [],
        transactionFee: [],
    }
    
    try {
        if(razorpayResource) {
            const instance = new Razorpay({ key_id: razorpayResource.key_id, key_secret: razorpayResource?.key_secret })
            try {
                const subscriptionReponse = await instance.subscriptions.all();
                const subscriptions = subscriptionReponse.items;
                subscriptions.filter(subscription => subscription.paid_count > 0)
                //SUBSCRIPTION INCOME
                for(const subscription of subscriptions) {
                    if(!subscription) continue;
                    const plan = await instance.plans.fetch(subscription.plan_id);
                    for(let i = 0; i < subscription.paid_count; i++) {
                        const date = new Date(subscription.start_at * 1000);
                        if(plan.period === 'yearly') {
                            date.setFullYear(date.getFullYear() + (i * plan.interval));
                        } else if(plan.period === 'monthly') {
                            date.setMonth(date.getMonth() + (i * plan.interval));
                        } else if(plan.period === 'weekly') {
                            date.setDate(date.getDate() + (i * 7 * plan.interval));
                        } else if(plan.period === 'daily') {
                            date.setDate(date.getDate() + (i * plan.interval));
                        }
                        incomeData.subscriptionRevenue.push({
                            date: date,
                            description: `${plan.item.name}|${plan.item.description as string}`,
                            amount: plan.item.unit_amount / 100
                        })
                    }
                }
            } catch (error) {
                console.log("SUBSCRIPTION DATA NOT FOUND", error);
            }
            //@TODO: REMOVE HARD CODED ACCOUNT NUMBER
            //TRANSACTION REVENUE
            try {
                const response = await axios.get('https://api.razorpay.com/v1/transactions', {
                    params: {
                        'account_number': '2323230039062652'
                    },
                    auth: {
                        username: razorpayResource.key_id,
                        password: razorpayResource.key_secret
                    }
                });
                if(response.data) {
                    const responseData = response.data as RazorpayTransactionAPIResponse;
                    const razorpayTransactions = responseData.items;
                    for(const razorpayTransaction of razorpayTransactions) {
                        if(!razorpayTransaction) continue;
                        if(razorpayTransaction.debit <= 0) continue; 
                        incomeData.transactionRevenue.push({
                            date: new Date(razorpayTransaction.created_at * 1000 ),
                            description: "No description",
                            amount: (razorpayTransaction.debit / 100),
                        })
                    }
                }
            } catch(error) {
                console.log("RazorPay Transaction Data Not Found", error);
            }

            //TOTAL INCOME
            const payments = (await instance.payments.all()).items;
            for(const payment of payments) {
                if(!payment) continue;
                if(payment.status !== 'captured') continue;

                incomeData.totalIncome.push({
                    date: new Date(payment.created_at * 1000),
                    description: "No description",
                    amount: (payment.amount as number / 100)
                })

                //TRANSACTION FEE
                incomeData.transactionFee.push({
                    date: new Date(payment.created_at * 1000),
                    description: "Fees",
                    amount: (payment.fee / 100)
                });
            }

            //VENDOR PAYOUT
            incomeData.vendorPayout.push(
                ...transactionData.filter(
                    transaction => transaction.amount < 0 && transaction.purpose === 'vendor bill'
                )
            )
            
        }

        //OTHER INCOME
        //TODO: ALSO INCLUDE UNACCOUNTED FOR RAZOR PAY TRANSACTIONS HERE
        incomeData.otherRevenue.push(
            ...transactionData.filter(transaction => transaction.amount > 0)
        )

        //TOTAL INCOME
        incomeData.totalIncome.push(
            ...transactionData.filter(transaction => transaction.amount > 0)
        )
    
    } catch(err) {
        console.log(err);
    }

    return incomeData;

}

const getExpenditureBreakdown = async (transactionData: Transaction[]) : Promise<ExpenditureBreakdown> => {
    const breakdown: ExpenditureBreakdown = {
        "Marketing Expenses": [],
        "Contractors": [],
        "Professional Services": [],
        "Salaries and Wages": [],
        "Payroll Taxes": [],
        "Other Payroll Expenses": [],
        "Tax Expenses": [],
        "Insurance": [],
        "Subscriptions": [],
        "Other Expenses": [],
        "Food and Drinks": [],
        "Office Supplies": [],
        "Office Space": [],
        "Hosting": [],
    };
    for(let i = 0; i < transactionData.length; i++) {
        const transaction = transactionData[i];
        if(!transaction) continue
        if(transaction.amount > 0) {
            const category = await getExpenseClassification(transaction.description);
            if(category) {
                switch(category) {
                    case "Subscriptions":
                        breakdown["Subscriptions"].push(transaction);
                        break;
                    case "Hosting & Infrastructure":
                        breakdown["Hosting"].push(transaction);
                        break;
                    case "Rent & Utilities":
                        breakdown["Office Space"].push(transaction);
                        break;
                    case "Marketing & Advertising":
                        breakdown["Marketing Expenses"].push(transaction);
                        break;
                    case "Legal & Professional Services":
                        breakdown["Professional Services"].push(transaction);
                        break;
                    case "Insurance":
                        breakdown["Insurance"].push(transaction);
                        break;
                    case "Travel & Team Expenses":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Hardware & Equipment":
                        breakdown["Office Supplies"].push(transaction);
                        break;
                    case "Employee Benefits":
                        breakdown["Other Payroll Expenses"].push(transaction);
                        break;
                    case "Training & Development":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Supply Chain Services":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Customer Support":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Salary & Wages":
                        breakdown["Salaries and Wages"].push(transaction);
                        break;
                    case "Taxes":
                        breakdown["Tax Expenses"].push(transaction);
                        break;
                    case "Professional fees":
                        breakdown["Professional Services"].push(transaction);
                        break;
                    case "Payment Gateway":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Other":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                }
            } else {
                breakdown["Other Expenses"].push(transaction);
            }
        }
    }
    return breakdown;
}

const getBalanceByDate = (transactionData: Transaction[], date: Date) : number => {
    let balance = 0;
    let closestDate = new Date(0);
    const finaltransactions = transactionData.filter(transaction => transaction.date.getTime() < date.getTime())
    for(let i = 0; i < finaltransactions.length; i++) {
        const transaction = finaltransactions[i];
        if(!transaction || !transaction.balance) continue;

        if(date.getTime() - transaction.date.getTime()
             <= date.getTime() - closestDate.getTime()) {
            closestDate = transaction.date;
            balance = transaction.balance;
            // console.log(transaction.description, transaction.amount, transaction.balance);
            // console.log(date, date.getTime());
            // console.log(transaction.date, transaction.date.getTime())
            // console.log(closestDate, closestDate.getTime())
            // console.log(date.getTime() - transaction.date.getTime())
            // console.log(date.getTime() - closestDate.getTime())
            // console.log("----------")
        }
    }
    return balance;
}


