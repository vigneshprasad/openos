import { prisma } from "~/server/db";

import { FINANCIAL_DATA } from "~/constants/commandConstants";
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


export const getRazorpayData = async (query: string, userId: string) => {
    const razorpayResources = await prisma.razorpayResource.findMany({
        where: {
            userId: userId
        }
    })
    const razorpayResource = razorpayResources[0];
    if(!razorpayResources || !razorpayResource) {
        return {
            type: FINANCIAL_DATA,
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

    try {
        const instance = new Razorpay({ key_id: razorpayResource.key_id, key_secret: razorpayResource.key_secret })
        const dateRange = await getDateRangeFromString(query);
        const customer = await getCustomerFromString(query);
        const orderId = getOrderIdFromString(query);
        const entityName = await getEntityFromString(query);
        switch(entityName) {
            case 'order':
                return await getOrderResults(instance, dateRange, customer, orderId);
            case 'payment':
                return await getPaymentResults(instance, dateRange, customer, orderId);
            case 'refund':
                return await getRefundResults(instance, dateRange, customer, orderId);
            case 'customer':
                return await getCustomerResults(instance, dateRange, customer, orderId);
        }
    } catch (error) {
        return {
            type: FINANCIAL_DATA,
            data: [
                undefined, 
                {
                    query: 'Request unprocessed',
                    message: 'Error while processing request',
                    cause: error
                }
            ]
        };
    }

}

const getOrderResults = async (
    instance: Razorpay,
    dateRange: DateRange | undefined,
    customer: CustomerDetails, 
    orderId: string | undefined
) => {
    if(orderId) {
        const orders = []
        orders.push(await instance.orders.fetch(orderId));
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'order',
                    result: orders
                },
                undefined
            ]
        };
    }
    if(customer.name || customer.email || customer.phone) {
        let payments = (await instance.payments.all()).items;
        if(customer.email) {
            payments = payments.filter(payment => payment.email === customer.email);
        } else if(customer.phone) {
            payments = payments.filter(payment => payment.contact === `+91${customer.phone as string}`);
        }
        const orders: Orders.RazorpayOrder[] = [];
        for(const payment of payments) {
            const order = await instance.orders.fetch(payment.order_id);
            orders.push(order)
        }
        const fromMilliseconds = dateRange?.from?.getMilliseconds();
        if(fromMilliseconds) {
            orders.filter(order => {
                order.created_at >= fromMilliseconds
            })
        } 
        const toMilliseconds = dateRange?.from?.getMilliseconds();
        if(toMilliseconds) {
            orders.filter(order => {
                order.created_at <= toMilliseconds
            })
        } 
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'order',
                    result: orders
                },
                undefined
            ]
        };

    } else {
        const fromMilliseconds = dateRange?.from && Math.floor(dateRange.from.getTime() / 1000)
        const toMilliseconds = dateRange?.to && Math.floor(dateRange.to.getTime() / 1000)
        const orders = await instance.orders.all({
            from: fromMilliseconds,
            to: toMilliseconds
        });
        console.log(orders);
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'order',
                    result: orders.items
                },
                undefined
            ]
        };
    }
}

const getPaymentResults = async (
    instance: Razorpay,
    dateRange: DateRange | undefined,
    customer: CustomerDetails, 
    orderId: string | undefined
) => {
    if(orderId) {
        const payments = (await instance.payments.all()).items;
        payments.filter(payment => payment.order_id === orderId)
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'payment',
                    result: payments
                },
                undefined
            ]
        };
    }
    if(customer.name || customer.email || customer.phone) {
        let payments = (await instance.payments.all()).items;
        if(customer.email) {
            payments = payments.filter(payment => payment.email === customer.email);
        } else if(customer.phone) {
            payments = payments.filter(payment => payment.contact === `+91${customer.phone as string}`);
        }
        const fromMilliseconds = dateRange?.from?.getMilliseconds();
        if(fromMilliseconds) {
            payments.filter(payment => {
                payment.created_at >= fromMilliseconds
            })
        } 
        const toMilliseconds = dateRange?.from?.getMilliseconds();
        if(toMilliseconds) {
            payments.filter(payment => {
                payment.created_at <= toMilliseconds
            })
        } 
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'payment',
                    result: payments
                },
                undefined
            ]
        };

    } else {
        const fromMilliseconds = dateRange?.from && Math.floor(dateRange.from.getTime() / 1000)
        const toMilliseconds = dateRange?.to && Math.floor(dateRange.to.getTime() / 1000)
        const payments = await instance.payments.all({
            from: fromMilliseconds,
            to: toMilliseconds
        });
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'payment',
                    result: payments.items
                },
                undefined
            ]
        };
    }
}

const getRefundResults = async (
    instance: Razorpay,
    dateRange: DateRange | undefined,
    customer: CustomerDetails, 
    orderId: string | undefined
) => {
    if(orderId) {
        const payments = (await instance.payments.all()).items;
        payments.filter(payment => payment.order_id === orderId)
        const refunds = [];
        for(const payment of payments) {
            const results = await instance.payments.fetchMultipleRefund(payment.id);
            for (const result of results.items) {
                refunds.push(result);
            }
        }
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'refund',
                    result: refunds
                },
                undefined
            ]
        };
    }
    if(customer.name || customer.email || customer.phone) {
        let payments = (await instance.payments.all()).items;
        if(customer.email) {
            payments = payments.filter(payment => payment.email === customer.email);
        } else if(customer.phone) {
            payments = payments.filter(payment => payment.contact === `+91${customer.phone as string}`);
        }
        const refunds = [];
        for(const payment of payments) {
            const results = await instance.payments.fetchMultipleRefund(payment.id);
            for (const result of results.items) {
                refunds.push(result);
            }
        }
        const fromMilliseconds = dateRange?.from?.getMilliseconds();
        if(fromMilliseconds) {
            refunds.filter(refund => {
                refund.created_at >= fromMilliseconds
            })
        } 
        const toMilliseconds = dateRange?.from?.getMilliseconds();
        if(toMilliseconds) {
            refunds.filter(refund => {
                refund.created_at <= toMilliseconds
            })
        } 
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'refund',
                    result: refunds
                },
                undefined
            ]
        };

    } else {
        const fromMilliseconds = dateRange?.from && Math.floor(dateRange.from.getTime() / 1000)
        const toMilliseconds = dateRange?.to && Math.floor(dateRange.to.getTime() / 1000)
        const refunds = await instance.refunds.all({
            from: fromMilliseconds,
            to: toMilliseconds
        });
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'refund',
                    result: refunds.items
                },
                undefined
            ]
        };
    }
}

const getCustomerResults = async (
    instance: Razorpay,
    dateRange: DateRange | undefined,
    customer: CustomerDetails, 
    orderId: string | undefined
) => {
    if(orderId) {
        const payments = (await instance.payments.all()).items;
        payments.filter(payment => payment.order_id === orderId)
        const customersDict: { [email: string]: Customer} = {};
        for(const payment of payments) {
            if(!payment.email) {
                continue;
            }
            if(customersDict.hasOwnProperty(payment.email)) {
                const customer = customersDict[payment.email];
                if(customer) {
                    customer.amount += Number(payment.amount) / 100;
                    continue;
                }
            }
            const customer = {
                id: payment.customer_id,
                email: payment.email,
                phone: payment.contact as string,
                amount: Number(payment.amount) / 100
            }
            customersDict[payment.email] = customer;
        }

        const customers = [];
        for(const customerObj of Object.values(customersDict)) {
            try {
                const customerInstance = await instance.customers.fetch(customerObj.id);
                customers.push({
                    ...customerObj,
                    name: customerInstance.name
                });
            } catch (error) {
                customers.push({
                    ...customerObj,
                })
            }
        }
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'customer',
                    result: customers
                },
                undefined
            ]
        };
    }
    if(customer.name || customer.email || customer.phone) {
        let payments = (await instance.payments.all()).items;
        if(customer.email) {
            payments = payments.filter(payment => payment.email === customer.email);
        } 
        if(customer.phone) {
            payments = payments.filter(payment => payment.contact === `+91${customer.phone as string}`);
        }

        const customersDict: { [email: string]: Customer} = {};
        for(const payment of payments) {
            if(!payment.email) {
                continue;
            }
            if(customersDict.hasOwnProperty(payment.email)) {
                const customer = customersDict[payment.email];
                if(customer) {
                    customer.amount += Number(payment.amount) / 100;
                    continue;
                }
            }
            const customer = {
                id: payment.email,
                email: payment.email,
                phone: payment.contact as string,
                amount: Number(payment.amount) / 100
            }
            customersDict[payment.email] = customer;
        }

        const customers = [];
        for(const customerObj of Object.values(customersDict)) {
            try {
                const customerInstance = await instance.customers.fetch(customerObj.id);
                customers.push({
                    ...customerObj,
                    name: customerInstance.name
                });
            } catch (error) {
                customers.push({
                    ...customerObj,
                })
            }
        }

        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'customer',
                    result: customers
                },
                undefined
            ]
        };

    } else {
        const fromMilliseconds = dateRange?.from && Math.floor(dateRange.from.getTime() / 1000)
        const toMilliseconds = dateRange?.to && Math.floor(dateRange.to.getTime() / 1000)
        const customerObjs = await instance.customers.all({
            from: fromMilliseconds,
            to: toMilliseconds
        });
        const customers:Customer[] = [];
        const payments = (await instance.payments.all(
            {
                from: fromMilliseconds,
                to: toMilliseconds
            }
        )).items;
        for(const customer of customerObjs.items) {
            const payments2 = payments.filter(payment => payment.email === customer.email);
            let amount = 0;
            const email = payments2[0]?.email;
            for(const payment of payments2) {
                amount += Number(payment.amount) / 100;
            }
            customers.push({
                id: customer.id,
                name: customer.name,
                email: customer.email || email || '',
                phone: customer.contact as string,
                amount
            })
        }
        return {
            type: FINANCIAL_DATA,
            data: [
                {
                    dateRange,
                    customer,
                    orderId,
                    entityName: 'customer',
                    result: customers
                },
                undefined
            ]
        };
    }
}