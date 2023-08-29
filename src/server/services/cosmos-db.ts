import { CosmosClient, type SqlQuerySpec } from "@azure/cosmos";
import { type ModelGraph, type ChurnCards, type AggregateChurnByPrimaryCohorts } from "../api/routers/dataModelRouter";
import moment from "moment";
 
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
            if(!resultsChurned[j] || !resultsTotal[j] || !results2Churned[j] || !results2Total[j]) {
                continue
            }

            const resultValue = resultsTotal.find((item) => item.label === resultData.cohort1.data[j]?.name)?.value
            const resultChurnValue = resultsChurned.find((item) => item.label === resultData.cohort1.data[j]?.name)?.value
            
            if(resultValue !== undefined && resultChurnValue !== undefined) {
                const cohort1result = resultChurnValue  / resultValue
                resultData.cohort1.data[j]?.data.push(
                    cohort1result
                )
            }

            const result2Value = results2Total.find((item) => item.label === resultData.cohort2.data[j]?.name)?.value
            const result2ChurnValue = results2Churned.find((item) => item.label === resultData.cohort2.data[j]?.name)?.value

            if(result2ChurnValue !== undefined && result2Value !== undefined) {
                const cohort2result = result2ChurnValue / result2Value;
                resultData.cohort2.data[j]?.data.push(
                    cohort2result
                )
            }
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
                predictedChurnUsers: resultChurnValue,
            });
         
        }

        const result2Value = results2Total.find((item) => item.label === cohort2Label)?.value
        const result2ChurnValue = results2Churned.find((item) => item.label === cohort2Label)?.value

        if(result2ChurnValue !== undefined && result2Value !== undefined) {
            resultData.cohort2.data.push({
                title: cohort2Label,
                totalUsers: result2Value,
                predictedChurnUsers: result2ChurnValue,
            });
        }

    }

    console.log(resultData);

    return resultData;
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
