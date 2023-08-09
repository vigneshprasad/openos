import { type ChurnCards, type ModelGraph, type IncludeAndExcludeUsers, type ScatterPlotData, type AggregateChurnByPrimaryCohorts} from "~/server/api/routers/dataModelRouter"
import { faker } from '@faker-js/faker';
import moment from "moment";

function encode(a: string): number {
    let number = 0;
    const length = a.length;
    for (let i = 0; i < length; i++)
        number += a.charCodeAt(i);
    return number;
}

export const getDummyIncludeAndExclude = (date: string, modelId: string, period: string): IncludeAndExcludeUsers => {

    const seed = encode(`${date}${modelId}${period}`)
    faker.seed(seed)

    let users = []
    for(let i = 0; i < 10; i++) {
        users.push({
            distinctId: faker.internet.email(),
            probability: faker.number.float({ min: 0, max: 1, }),
        })
    }
    users = users.sort((a, b) => b.probability - a.probability)
    const excludeUsers = users.slice(0, 5)
    const includeUsers = users.slice(5, 10).reverse()

    return {
        include: {
            users: includeUsers.sort((a, b) => b.probability - a.probability),
            userList: {
                heading: "",
                sheet: [],
            }
        },
        exclude: {
            users: excludeUsers.sort((a, b) => a.probability - b.probability),
            userList: {
                heading: "",
                sheet: [],
            }
        }
    }
}

export const getDummyScatterPlot = (date: string, modelId: string, period: string, featureId: string): ScatterPlotData => {

    const seed = encode(`${date}${modelId}${period}${featureId}`)
    faker.seed(seed)

    if(featureId === "dummy1") {
        return {
            series: [
                {
                    x: "Ad Group 1",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Ad Group 2",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Ad Group 3",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Ad Group 4",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Ad Group 5",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Ad Group 6",
                    y: faker.number.float({ min: 0, max: 1, }),
                },

            ]
        }        
    }

    if(featureId === "dummy2") {
        return {
            series: [
                {
                    x: "Apple iPhone 12",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Apple iPhone 13",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Apple iPhone 13 Pro Max",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Samsung Galaxy S21",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Google Pixel 6",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "One Plus 9",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
            ]
        }
    }

    if(featureId === "dummy3") {
        return {
            series: [
                {
                    x: 0,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: 1,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: 2,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: 3,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: 4,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: 5,
                    y: faker.number.float({ min: 0, max: 1, }),
                },
            ]
        }
    }

    if(featureId === "dummy4") {
        return {
            series: [
                {
                    x: "Bangalore",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Jaipur",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "New Delhi",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Mumbai",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Chennai",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Kokata",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Hyderabad",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Pune",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
            ]
        }
    }

    if(featureId === "dummy5") {
        return {
            series: [
                {
                    x: "Less than a minute",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "1 - 5 minutes",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "5 - 10 minutes",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "10 - 15 minutes",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "15+ minutes",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
            ]
        }
    }

    if(featureId === "dummy6") {
        return {
            series: [
                {
                    x: "Developer",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Product Manager",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "UI/UX Designer",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Sales and Marketing",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
                {
                    x: "Dev Ops",
                    y: faker.number.float({ min: 0, max: 1, }),
                },
            ]
        }
    }

    return {
        series: []
    }


}

export const getDummyChurnCards = (date: string, modelId: string, period: string):ChurnCards => {
    const seed = encode(`${date}${modelId}${period}`)
    faker.seed(seed)

    const totalUsers = faker.number.int({ min: 5000, max: 10000, });
    const totalUsersDeviation = faker.number.float({ min: 0, max: 100, });
    const predictedChurn = faker.number.float({ min: 0, max: 100, });
    const predictedChurnDeviation = faker.number.float({ min: 0, max: 100, });
    const actualChurn = faker.number.float(
            {
                min: Math.max(predictedChurn - 15, 0), 
                max: Math.min(predictedChurn + 15, 100) 
            }
        );
    const actualChurnDeviation = faker.number.float({ min: 0, max: 100, });
    
    return {
        totalUsers,
        totalUsersDeviation,
        predictedChurn,
        predictedChurnDeviation,
        actualChurn,
        actualChurnDeviation,
    }
}

export const getDummyModelGraph = (dateInput: string, modelId: string, period: string):ModelGraph => {
    const timeSeries: Date[] = []
    if(period === "weekly") {
        const date = moment(dateInput, "DD/MM/YYYY")
        for(let i = 0; i < 8; i++) {
            const new_date = moment(date).add((i), 'days').toDate();
            timeSeries.push(new_date);
        }
    } else {
        const date = moment(dateInput, "DD/MM/YYYY")
        
        for(let i = 1; i <= 6; i++) {
            const new_date = moment(date).add((i*4), 'hours').toDate();
            timeSeries.push(new_date);
        }
    }
    const seed = encode(`${dateInput}${modelId}${period}`)
    faker.seed(seed)

    const resultData: ModelGraph = {
        cohort1: {
            xAxis: timeSeries.slice(0, timeSeries.length - 1),
            title: 'UTM Source',
            data: [
                {
                    name: "Google",
                    data: []
                },
                {
                    name: "Facebook",
                    data: []
                },
                {
                    name: "LinkedIn",
                    data: []
                },
                {
                    name: "Twitter",
                    data: []
                },
                {
                    name: "Email Newsletter",
                    data: []
                },
            ]
        },
        cohort2: {
            xAxis: timeSeries.slice(0, timeSeries.length - 1),
            title: 'UTM Medium',
            data: [
                {
                    name: "PPC",
                    data: []
                },
                {
                    name: "Social",
                    data: []
                },
                {
                    name: "Email",
                    data: []
                },
                {
                    name: "Referral",
                    data: []
                },
                {
                    name: "Direct",
                    data: []
                },
            ]
        }
    }
    for (let i = 0; i < timeSeries.length - 1; i++) {
        for (let j = 0; j < 5; j++) {
            resultData.cohort1.data[j]?.data.push(
                faker.number.float({ min: 0, max: 1, })
            )
            resultData.cohort2.data[j]?.data.push(
                faker.number.float({ min: 0, max: 1, })
            )
        }
    }

    return resultData;
}

export const getDummyAggregateChurnByPrimaryCohorts = (date: string, modelId: string, period: string):AggregateChurnByPrimaryCohorts => {

    const seed = encode(`${date}${modelId}${period}`)
    faker.seed(seed)

    const resultData: AggregateChurnByPrimaryCohorts = {
        cohort1: {
            title: 'UTM Source',
            data: [
                {
                    title: "Google",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Facebook",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "LinkedIn",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Twitter",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Email Newsletter",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
            ]
        },
        cohort2: {
            title: 'UTM Medium',
            data: [
                {
                    title: "PPC",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Social",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Email",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Referral",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
                {
                    title: "Direct",
                    totalUsers: faker.number.int({min: 2000, max: 5000}),
                    predictedChurnUsers: faker.number.float({ min: 0, max: 100})
                },
            ]
        }
    }

    return resultData;


}