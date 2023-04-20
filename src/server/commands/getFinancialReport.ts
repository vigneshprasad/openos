import { prisma } from "~/server/db";
import { getRazorpayTransactionData } from "~/utils/getExpenditureTransactionData";
import { type RazorpayResource } from "@prisma/client";
import Razorpay from "razorpay";
import axios from "axios";
import { getMonthlyTimeSeries } from "~/utils/getTimeSeries";
import { type ExcelCell } from "~/types/types";
import { getProphetProjectionsReport } from "~/utils/getProphetProjections";
import { REPORT_PROJECTIONS } from "~/constants/prophetConstants";

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
    category?: string
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

export const getFinancialReport = async (userId: string) => {
    const razorpayResources = await prisma.razorpayResource.findMany({
        where: {
            userId: userId
        }
    })

    const razorpayResource = razorpayResources[0];
    const bankTransactionsRaw = await prisma.transaction.findMany({
        where: {
            userId: userId
            }
    });
    const bankTransactions:Transaction[] = bankTransactionsRaw.map((transaction) => ({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toNumber() || 0,
        balance: transaction.balance.toNumber(),
        category: transaction.category
    }))

    let transactions = [...bankTransactions];
    let razorpayTransactions:Transaction[] = []
    if(razorpayResource) {
        razorpayTransactions = await getRazorpayTransactionData(razorpayResource);
        transactions = [...bankTransactions, ...razorpayTransactions];
    }
    if(transactions.length === 0) {
        return [
            undefined,
            {
                query: 'Request unprocessed',
                message: 'No transactions found',
                cause: 'No bank transactions or RazorPay not found'
            }
        ]
    }

    const expenditureBreakdown = getExpenditureBreakdown(transactions);
    const incomeData = await getIncomeData(razorpayResource, transactions);
    const timeSeries = getMonthlyTimeSeries(13);
    
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

    const vendorPayout: ExcelCell[] = [{value: 'Vendor Payout'}];
    const transactionFee: ExcelCell[] = [{value: 'Transaction Fee'}];
    const hosting: ExcelCell[] = [{value: 'Hosting'}];
    const grossProfit: ExcelCell[] = [{value: 'Gross Profit'}];

    const marketingExpenses: ExcelCell[] = [{value: 'Marketing Expenses'}];
    const contractors: ExcelCell[] = [{value: 'Contractors'}];
    const professionalServices: ExcelCell[] = [{value: 'Professional Services'}];
    const salariesAndWages: ExcelCell[] = [{value: 'Salaries and Wages'}];
    const payrollTaxes: ExcelCell[] = [{value: 'Payroll Taxes'}];
    const otherPayrollExpenses: ExcelCell[] = [{value: 'Other Payroll Expenses'}];
    const taxExpenses: ExcelCell[] = [{value: 'Tax Expenses'}];
    const insurance: ExcelCell[] = [{value: 'Insurance'}];
    const subscriptionsExpenditure: ExcelCell[] = [{value: 'Subscriptions'}];
    const otherExpenses: ExcelCell[] = [{value: 'Other Expenses'}];
    const foodAndDrinks: ExcelCell[] = [{value: 'Food and Drinks'}];
    const officeSupplies: ExcelCell[] = [{value: 'Office Supplies'}];
    const officeSpace: ExcelCell[] = [{value: 'Office Space'}];
    const expensesTotal: ExcelCell[] = [{value: 'Expenses Total'}];
    const netIncome: ExcelCell[] = [{value: 'Net Income'}];

    for(let i = 1; i < timeSeries.length; i++) {
        const time = timeSeries[i];
        time?.setDate(time.getDate() - 1);
        if(!time) continue;
        reportHeader.push({
            value: time.toDateString(),
            unit: '₹',
            unitPrefix: true
        })
        bankBalance.push({
            value: getBalanceByDate(bankTransactions, time),
            unit: '₹',
            unitPrefix: true
        });
        razorpayBalance.push({
            value: getBalanceByDate(razorpayTransactions, time),
            unit: '₹',
            unitPrefix: true
        });
        bankBalanceGrowthPercent.push({
            value: ((bankBalance[i]?.value as number) / (bankBalance[i - 1]?.value as number) * 100).toFixed(2),
            expression: `=${String.fromCharCode(65 + i + 1)}1/${String.fromCharCode(65 + i)}1 * 100`,
            unit: '%'
        });
        razorpayBalanceGrowthPercent.push({
            value: ((razorpayBalance[i]?.value as number) / (razorpayBalance[i - 1]?.value as number) * 100).toFixed(2),
            expression: `=${String.fromCharCode(65 + i + 1)}1/${String.fromCharCode(65 + i)}1 * 100`,
            unit: '%'
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
            value: subscriptionRevenueAmount.toFixed(2)
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
            value: transactionRevenueAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
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
            value: otherRevenueAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
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
            value: totalRevenueAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
        })

        //VENDOR PAYOUT
        const filteredVendorPayout = incomeData.vendorPayout.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let vendorPayoutAmount = 0;
        for(const transaction of filteredVendorPayout) {
            vendorPayoutAmount+= transaction.amount;
        }
        vendorPayout.push({
            value: vendorPayoutAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
        })

        //TRANSACTION FEE
        const filteredTransactionFee = incomeData.transactionFee.filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let transactionFeeAmount = 0;
        for(const transaction of filteredTransactionFee) {
            transactionFeeAmount+= transaction.amount;
        }
        transactionFee.push({
            value: transactionFeeAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
        })

        //HOSTING
        const filteredHosting = expenditureBreakdown['Hosting'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let hostingAmount = 0;
        for(const transaction of filteredHosting) {
            hostingAmount+= transaction.amount;
        }
        hosting.push({
            value: (hostingAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        })

        //GROSS PROFIT
        const grossProfitAmount = totalRevenueAmount - vendorPayoutAmount - transactionFeeAmount - hostingAmount;
        grossProfit.push({
            value: grossProfitAmount.toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //MARKETING EXPENSES
        const filteredMarketingExpenses = expenditureBreakdown['Marketing Expenses'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let marketingExpensesAmount = 0;
        for(const transaction of filteredMarketingExpenses) {
            marketingExpensesAmount+= transaction.amount;
        }
        marketingExpenses.push({
            value: (marketingExpensesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //CONTRACTORS
        const filteredContractors = expenditureBreakdown['Contractors'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let contractorsAmount = 0;
        for(const transaction of filteredContractors) {
            contractorsAmount+= transaction.amount;
        }
        contractors.push({
            value: (contractorsAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //PROFESSIONAL SERVICES
        const filteredProfessionalServices = expenditureBreakdown['Professional Services'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let professionalServicesAmount = 0;
        for(const transaction of filteredProfessionalServices) {
            professionalServicesAmount+= transaction.amount;
        }
        professionalServices.push({
            value: (professionalServicesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //SALARIES AND WAGES
        const filteredSalariesAndWages = expenditureBreakdown['Salaries and Wages'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let salariesAndWagesAmount = 0;
        for(const transaction of filteredSalariesAndWages) {
            salariesAndWagesAmount+= transaction.amount;
        }
        salariesAndWages.push({
            value: (salariesAndWagesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });


        //PAYROLL TAXES
        const filteredPayrollTaxes = expenditureBreakdown['Payroll Taxes'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let payrollTaxesAmount = 0;
        for(const transaction of filteredPayrollTaxes) {
            payrollTaxesAmount+= transaction.amount;
        }
        payrollTaxes.push({
            value: (payrollTaxesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });        

        //OTHER PAYROLL EXPENSES
        const filteredPayrollExpenses = expenditureBreakdown['Payroll Taxes'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let payrollExpensesAmount = 0;
        for(const transaction of filteredPayrollExpenses) {
            payrollExpensesAmount+= transaction.amount;
        }
        otherPayrollExpenses.push({
            value: (payrollExpensesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //TAX EXPENSES
        const filteredTaxExpenses = expenditureBreakdown['Tax Expenses'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let taxExpensesAmount = 0;
        for(const transaction of filteredTaxExpenses) {
            taxExpensesAmount+= transaction.amount;
        }
        taxExpenses.push({
            value: (taxExpensesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });
        
        //INSURANCE
        const filteredInsurance = expenditureBreakdown['Insurance'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let insuranceAmount = 0;
        for(const transaction of filteredInsurance) {
            insuranceAmount+= transaction.amount;
        }
        insurance.push({
            value: (insuranceAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //SUBSCRIPTIONS
        const filteredSubscriptionsExpenditure = expenditureBreakdown['Subscriptions'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let subscriptionsAmount = 0;
        for(const transaction of filteredSubscriptionsExpenditure) {
            subscriptionsAmount+= transaction.amount;
        }
        subscriptionsExpenditure.push({
            value: (subscriptionsAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //OTHER EXPENSES
        const filteredOtherExpenses = expenditureBreakdown['Other Expenses'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let otherExpensesAmount = 0;
        for(const transaction of filteredOtherExpenses) {
            otherExpensesAmount+= transaction.amount;
        }
        otherExpenses.push({
            value: (otherExpensesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //FOOD AND DRINKS
        const filteredFoodAndDrinks = expenditureBreakdown['Food and Drinks'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let foodAndDrinksAmount = 0;
        for(const transaction of filteredFoodAndDrinks) {
            foodAndDrinksAmount+= transaction.amount;
        }
        foodAndDrinks.push({
            value: (foodAndDrinksAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //OFFICE SUPPLIES
        const filteredOfficeSupplies = expenditureBreakdown['Office Supplies'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let officeSuppliesAmount = 0;
        for(const transaction of filteredOfficeSupplies) {
            officeSuppliesAmount+= transaction.amount;
        }
        officeSupplies.push({
            value: (officeSuppliesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //OFFICE SPACE
        const filteredOfficeSpace = expenditureBreakdown['Office Space'].filter((transaction) => {
            return transaction.date >= prevTime && transaction.date <= time;
        });
        let officeSpaceAmount = 0;
        for(const transaction of filteredOfficeSpace) {
            officeSpaceAmount+= transaction.amount;
        }
        officeSpace.push({
            value: (officeSpaceAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });

        //EXPENSES TOTAL
        const totalExpensesAmount = marketingExpensesAmount + 
            contractorsAmount + 
            professionalServicesAmount + 
            salariesAndWagesAmount + 
            payrollTaxesAmount + 
            payrollExpensesAmount +
            taxExpensesAmount + 
            insuranceAmount + 
            subscriptionsAmount + 
            otherExpensesAmount + 
            foodAndDrinksAmount + 
            officeSuppliesAmount + 
            officeSpaceAmount;
        expensesTotal.push({
            value: (totalExpensesAmount * -1).toFixed(2),
            unit: '₹',
            unitPrefix: true
        })

        //NET INCOME
        netIncome.push({
            value: (grossProfitAmount + totalExpensesAmount).toFixed(2),
            unit: '₹',
            unitPrefix: true
        });
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
    reportTable.push(vendorPayout);
    reportTable.push(transactionFee);
    reportTable.push(hosting);
    reportTable.push(grossProfit);
    reportTable.push(marketingExpenses);
    reportTable.push(contractors);
    reportTable.push(professionalServices);
    reportTable.push(salariesAndWages);
    reportTable.push(payrollTaxes);
    reportTable.push(otherPayrollExpenses);
    reportTable.push(taxExpenses);
    reportTable.push(insurance);
    reportTable.push(subscriptionsExpenditure);
    reportTable.push(otherExpenses);
    reportTable.push(foodAndDrinks);
    reportTable.push(officeSupplies);
    reportTable.push(officeSpace);
    reportTable.push(expensesTotal);
    reportTable.push(netIncome);

    const reportTableWithProjections = await getProphetProjectionsReport(
        reportTable,
        REPORT_PROJECTIONS,
        'M'
    );

    return [
        {
            heading: 'Financial Report',
            sheet: reportTableWithProjections,
        },
        undefined
    ]
}

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
            //TRANSACTION REVENUE
            try {
                const response = await axios.get('https://api.razorpay.com/v1/transactions', {
                    params: {
                        'account_number': razorpayResource.account_number
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
        //@TO DO: ALSO INCLUDE UNACCOUNTED FOR RAZOR PAY TRANSACTIONS HERE
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

const getExpenditureBreakdown = (transactionData: Transaction[]) : ExpenditureBreakdown => {
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
        if(transaction.amount < 0) {
            if(transaction.category) {
                switch(transaction.category) {
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
                    case "Professional Services":
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
                    case "Salary and Wages":
                        breakdown["Salaries and Wages"].push(transaction);
                        break;
                    case "Taxes":
                        breakdown["Tax Expenses"].push(transaction);
                        break;
                    case "Professional Fees":
                        breakdown["Professional Services"].push(transaction);
                        break;
                    case "Payment Gateway":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    case "Other":
                        breakdown["Other Expenses"].push(transaction);
                        break;
                    default:
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
        }
    }
    return balance;
}