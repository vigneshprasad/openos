import { CosmosClient, type SqlQuerySpec } from "@azure/cosmos";
import { type ModelGraph, type ChurnCards, type AggregateChurnByPrimaryCohorts, IncludeAndExcludeUsers, LookAlikeUsers } from "../api/routers/dataModelRouter";
import moment from "moment";
import { ExcelCell } from "~/types/types";
import { Prisma } from "@prisma/client";
 
const endpoint = process.env.COSMOS_END_POINT // Add your endpoint
const masterKey = process.env.COSMOS_MASTER_KEY // Add the masterkey of the endpoint
const client = new CosmosClient(`AccountEndpoint=${endpoint ? endpoint: ""}/;AccountKey=${masterKey ? masterKey: ""}`);

const databaseId  = "openos"; // Add the Database ID


export const getLastDate = async (modelId: string): Promise<Date | void> => {
    const querySpec = {
        query: "SELECT TOP 1 * FROM c ORDER BY c.eventDate DESC"    
    };
    interface IResultType {
        created: string
    }
    const results = await runQuery(querySpec, modelId)
    if (results.resources[0]) {
        const resources = results.resources[0] as IResultType
        return new Date(resources.created)
    }
    
}


export const getChurnCards = async (modelId: string, startDate: string, endDate: string): Promise<ChurnCards> => {
    const startDateMoment = moment(startDate, "DD/MM/YYYY")
    const endDateMoment = moment(endDate, "DD/MM/YYYY").add(1, 'days');
    const period = endDateMoment.diff(startDateMoment, 'days');
    const previousStartDate = moment(startDateMoment).subtract(period, 'days');
    const previousEndDate = startDateMoment;

    const currentTotalUsers = await getUserCountByDate(modelId, startDateMoment.valueOf() / 1000, endDateMoment.valueOf() / 1000)
    const currentChurnedUsers = await getUserCountByDate(modelId, startDateMoment.valueOf() / 1000, endDateMoment.valueOf() / 1000, "probability", "0.5", ">")
    const currentActualChurnedUsers = await getUserCountByDate(modelId, startDateMoment.valueOf() / 1000, endDateMoment.valueOf() / 1000, "actualValue", "1", "=")
    const currentActualNotChurnedUsers = await getUserCountByDate(modelId, startDateMoment.valueOf() / 1000, endDateMoment.valueOf() / 1000, "actualValue", "0", "=")
    const currentActualTotalUsers = currentActualChurnedUsers + currentActualNotChurnedUsers
    const currentActualChurn = currentActualChurnedUsers / currentActualTotalUsers * 100
    const currentChurn = currentChurnedUsers / currentTotalUsers * 100

    const previousTotalUsers = await getUserCountByDate(modelId, previousStartDate.valueOf() / 1000, previousEndDate.valueOf() / 1000)
    const previousChurnedUsers = await getUserCountByDate(modelId, previousStartDate.valueOf() / 1000, previousEndDate.valueOf() / 1000, "probability", "0.5", ">")
    const previousActualChurnedUsers = await getUserCountByDate(modelId, previousStartDate.valueOf() / 1000, previousEndDate.valueOf() / 1000, "actualValue", "1", "=")
    const previousActualNotChurnedUsers = await getUserCountByDate(modelId, previousStartDate.valueOf() / 1000, previousEndDate.valueOf() / 1000, "actualValue", "0", "=")
    const previousActualTotalUsers = previousActualChurnedUsers + previousActualNotChurnedUsers
    const previousActualChurn = previousActualChurnedUsers / previousActualTotalUsers * 100
    const previousChurn = previousChurnedUsers / previousTotalUsers * 100

    const churnResults:ChurnCards = {
        totalUsers: currentTotalUsers,
        totalUsersDeviation: (currentTotalUsers - previousTotalUsers) / previousTotalUsers * 100,
        predictedChurn: currentChurn,
        predictedChurnDeviation: currentChurn - previousChurn,
        actualChurn: currentActualChurnedUsers / currentActualTotalUsers * 100,
        actualChurnDeviation: currentActualChurn - previousActualChurn,
    }
    
    return churnResults
    
}

export const getModelPrimaryGraph = async (modelId: string, startDate: string, endDate: string, timeSeries: Date[], cohort1: string, cohort2: string): Promise<ModelGraph> => {
    const start = moment(startDate, "DD/MM/YYYY").valueOf() / 1000
    const end = moment(endDate, "DD/MM/YYYY").add(1, 'days').valueOf() / 1000;

    interface IResultType {
        value: number
        label: string
    }
    const querySpec = {
        query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} GROUP BY c.${cohort1}`
    }
    const results = (await runQuery(querySpec, modelId)).resources as unknown as IResultType[]
    const top5Cohort1 = results.sort((a, b) => b.value - a.value).splice(0, 5)
    const cohort1Values = top5Cohort1.map((item) => item.label)

    const querySpec2 = {
        query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} GROUP BY c.${cohort2}`
    }
    const results2 = (await runQuery(querySpec2, modelId)).resources as unknown as IResultType[]
    const top5Cohort2 = results2.sort((a, b) => b.value - a.value).splice(0, 5)
    const cohort2Values = top5Cohort2.map((item) => item.label)
    
    const resultData: ModelGraph = {
        cohort1: {
            xAxis: timeSeries.slice(0, timeSeries.length),
            title: cohort1,
            data: []
        },
        cohort2: {
            xAxis: timeSeries.slice(0, timeSeries.length),
            title: cohort2,
            data: []
        }
    }
    for(let i = 0; i < 5; i++) {
        const cohort1 = cohort1Values[i] ? cohort1Values[i] : ""
        const cohort2 = cohort2Values[i] ? cohort2Values[i] : ""
        if(!cohort1 || !cohort2) {
            return resultData
        }
        resultData.cohort1.data.push({
            name: cohort1,
            data: []
        });
        resultData.cohort2.data.push({
            name: cohort2,
            data: []
        })
    }

    for(let i = 0; i < timeSeries.length - 1; i++) {
        const start = moment(timeSeries[i]).valueOf() / 1000;
        const end = moment(timeSeries[i + 1]).valueOf() / 1000;
        const cohort1String = "(" + cohort1Values.map((item) => `'${item}'`).join(",") + ")"
        const cohort2String = "(" + cohort2Values.map((item) => `'${item}'`).join(",") + ")"
        const querySpecTotal = {
            query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort1} in ${cohort1String} GROUP BY c.${cohort1}`
        }
        const querySpec2Total = {
            query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort2} in ${cohort2String} GROUP BY c.${cohort2}`
        }
        const querySpecChurned = {
            query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort1} in ${cohort1String} AND c.probability > 0.5 GROUP BY c.${cohort1}`
        }
        const querySpec2Churned = {
            query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort2} in ${cohort2String} AND c.probability > 0.5 GROUP BY c.${cohort2}`
        }

        const resultsTotal = (await runQuery(querySpecTotal, modelId)).resources as unknown as IResultType[]
        const results2Total = (await runQuery(querySpec2Total, modelId)).resources as unknown as IResultType[]
        const resultsChurned = (await runQuery(querySpecChurned, modelId)).resources as unknown as IResultType[]
        const results2Churned = (await runQuery(querySpec2Churned, modelId)).resources as unknown as IResultType[]


        for(let j = 0; j < 5; j++) { 
            let resultValue = resultsTotal.find((item) => item.label === resultData.cohort1.data[j]?.name)?.value
            let resultChurnValue = resultsChurned.find((item) => item.label === resultData.cohort1.data[j]?.name)?.value
            resultChurnValue = resultChurnValue ? resultChurnValue : 0
            resultValue = resultValue ? resultValue : 0
            
            const cohort1result = resultChurnValue  / resultValue
            resultData.cohort1.data[j]?.data.push(
                cohort1result
            )

            let result2Value = results2Total.find((item) => item.label === resultData.cohort2.data[j]?.name)?.value
            let result2ChurnValue = results2Churned.find((item) => item.label === resultData.cohort2.data[j]?.name)?.value

            result2Value = result2Value ? result2Value : 0
            result2ChurnValue = result2ChurnValue ? result2ChurnValue : 0

            const cohort2result = result2ChurnValue / result2Value;
            resultData.cohort2.data[j]?.data.push(
                cohort2result
            )
        }
    }

    
    return resultData;
}


export const getAggregateChurnByPrimaryCohorts = async (modelId: string, startDate: string, endDate: string, cohort1: string, cohort2: string): Promise<AggregateChurnByPrimaryCohorts> => {
    const resultData: AggregateChurnByPrimaryCohorts = {
        cohort1: {
            title: cohort1,
            data: []
        },
        cohort2: {
            title: cohort2,
            data: []
        }
    }

    const start = moment(startDate, "DD/MM/YYYY").valueOf() / 1000
    const end = moment(endDate, "DD/MM/YYYY").add(1, 'days').valueOf() / 1000;

    interface IResultType {
        value: number
        label: string
    }

    const querySpec = {
        query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} GROUP BY c.${cohort1}`
    }
    const results = (await runQuery(querySpec, modelId)).resources as unknown as IResultType[]
    const top5Cohort1 = results.sort((a, b) => b.value - a.value).splice(0, 10)
    const cohort1Values = top5Cohort1.map((item) => item.label)

    const querySpec2 = {
        query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} GROUP BY c.${cohort2}`
    }
    const results2 = (await runQuery(querySpec2, modelId)).resources as unknown as IResultType[]
    const top5Cohort2 = results2.sort((a, b) => b.value - a.value).splice(0, 10)
    const cohort2Values = top5Cohort2.map((item) => item.label)
    

    const cohort1String = "(" + cohort1Values.map((item) => `'${item}'`).join(",") + ")"
    const cohort2String = "(" + cohort2Values.map((item) => `'${item}'`).join(",") + ")"
    const querySpecTotal = {
        query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort1} in ${cohort1String} GROUP BY c.${cohort1}`
    }
    const querySpec2Total = {
        query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort2} in ${cohort2String} GROUP BY c.${cohort2}`
    }
    const querySpecChurned = {
        query: `SELECT c.${cohort1} AS "label", COUNT(c.${cohort1}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort1} in ${cohort1String} AND c.probability > 0.5 GROUP BY c.${cohort1}`
    }
    const querySpec2Churned = {
        query: `SELECT c.${cohort2} AS "label", COUNT(c.${cohort2}) AS "value" FROM c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} AND c.${cohort2} in ${cohort2String} AND c.probability > 0.5 GROUP BY c.${cohort2}`
    }

    const resultsTotal = (await runQuery(querySpecTotal, modelId)).resources as unknown as IResultType[]
    const results2Total = (await runQuery(querySpec2Total, modelId)).resources as unknown as IResultType[]
    const resultsChurned = (await runQuery(querySpecChurned, modelId)).resources as unknown as IResultType[]
    const results2Churned = (await runQuery(querySpec2Churned, modelId)).resources as unknown as IResultType[]

    for(let j = 0; j < 10; j++) { 
        if(!resultsChurned[j] || !resultsTotal[j] || !results2Churned[j] || !results2Total[j]) {
            continue
        }

        const cohort1Label = cohort1Values[j] ? cohort1Values[j] : ""
        const cohort2Label = cohort2Values[j] ? cohort2Values[j] : ""
        if(!cohort1Label || !cohort2Label) {
            return resultData
        }

        const resultValue = resultsTotal.find((item) => item.label === cohort1Label)?.value
        const resultChurnValue = resultsChurned.find((item) => item.label === cohort1Label)?.value
            
        if(resultValue !== undefined && resultChurnValue !== undefined) {
            resultData.cohort1.data.push({
                title: cohort1Label,
                totalUsers: resultValue,
                predictedChurnUsers: resultChurnValue / resultValue * 100,
            });
         
        }

        const result2Value = results2Total.find((item) => item.label === cohort2Label)?.value
        const result2ChurnValue = results2Churned.find((item) => item.label === cohort2Label)?.value

        if(result2ChurnValue !== undefined && result2Value !== undefined) {
            resultData.cohort2.data.push({
                title: cohort2Label,
                totalUsers: result2Value,
                predictedChurnUsers: result2ChurnValue / result2Value * 100,
            });
        }

    }

    return resultData;
}

export const getIncludeAndExcludeUsers = async (modelId: string, startDate: string, endDate: string, type: string): Promise<IncludeAndExcludeUsers> => {

    const start = moment(startDate, "DD/MM/YYYY").valueOf() / 1000
    const end = moment(endDate, "DD/MM/YYYY").add(1, 'days').valueOf() / 1000;

    const includeUserListSheet: ExcelCell[][] = [];
    const excludeUserListSheet: ExcelCell[][] = [];

    const includeUsers: LookAlikeUsers[] = [];
    const excludeUsers: LookAlikeUsers[] = [];

    const querySpec = {
        query: `SELECT TOP 100 * from c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} ORDER BY c.probability DESC`
    }
    const results = (await runQuery(querySpec, modelId)).resources


    const querySpec2 = {
        query: `SELECT TOP 100 * from c where c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end} ORDER BY c.probability ASC`
    }
    const results2 = (await runQuery(querySpec2, modelId)).resources

    const headings:string[] = [];
    for(let j = 0; j < results.length; j++) {
        const userPrediction = results[j] as Prisma.JsonObject;
        for (const key in userPrediction) {
            if(!headings.includes(key)) {
                headings.push(key);
            }
        }
        const userPrediction2 = results2[j] as Prisma.JsonObject;
        for (const key in userPrediction2) {
            if(!headings.includes(key)) {
                headings.push(key);
            }
        }
    }
    const header: ExcelCell[] = [];
    for(const key of headings) { 
        header.push({
            value: key
        })
    }

    includeUserListSheet.push(header);
    excludeUserListSheet.push(header);

    const includeList = type == 'Conversion' ? results : results2;
    const excludeList = type == 'Conversion' ? results2 : results;

    for(let j = 0; j < includeList.length; j++) {
        const userPrediction = includeList[j] as Prisma.JsonObject;
        const row: ExcelCell[] = [];
        for(const key of headings) { 
            const userPredictionValue:string = (userPrediction[key] ? userPrediction[key] : "") as string
            row.push({
                value: userPredictionValue
            })
        }
        includeUserListSheet.push(row);
        if(j < 10) {
            includeUsers.push({
                distinctId: userPrediction['distinctId'] as string,
                probability: userPrediction.probability as number,
            })
        }
    }

    for(let j = 0; j < excludeList.length; j++) {
        const userPrediction = excludeList[j] as Prisma.JsonObject;
        const row: ExcelCell[] = [];
        for(const key of headings) { 
            const userPredictionValue:string = (userPrediction[key] ? userPrediction[key] : "") as string
            row.push({
                value: userPredictionValue
            })
        }
        excludeUserListSheet.push(row);
        if(j < 10) {
            excludeUsers.push({
                distinctId: userPrediction['distinctId'] as string,
                probability: userPrediction.probability as number,
            })
        }
    }

    return {
        include: {
            users: includeUsers,
            userList: {
                heading: 'Include Users',
                sheet: includeUserListSheet
            }
        },
        exclude: {
            users: excludeUsers,
            userList: {
                heading: 'Exclude Users',
                sheet: excludeUserListSheet
            }
        }
    }
}


const getUserCountByDate = async (modelId: string, start: number, end: number, filter1Param?:  string, filter1Value?: string, filterCondition?: string): Promise<number> => {
    let query = `SELECT VALUE COUNT(1) FROM c WHERE c.eventTimestamp >= ${start} AND c.eventTimestamp <= ${end}`
    if (filter1Param && filter1Value && filterCondition) {
        query = query + ` AND c.${filter1Param} ${filterCondition} ${filter1Value}`
    }
    const querySpec = {
        query: query,
    };
    const results = await runQuery(querySpec, modelId)
    return results?.resources[0] as number
}

const runQuery = async (querySpec: string | SqlQuerySpec, containerId: string) => {
    const database = client?.database(databaseId);
    const container = database?.container(containerId);
    const items = container?.items;
    const results = await items?.query(querySpec, { enableScanInQuery: true }).fetchAll();
    return results
}
