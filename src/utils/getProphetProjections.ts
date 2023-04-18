import axios from "axios";
import { PROPHET_API_URL } from "~/constants/prophetConstants";
import { type ExcelCell } from "~/types/types";

type ProphetArrayResult = {
    ds: {
        [key: string]: number
    }
    yhat: {
        [key: string]: number
    }
}

type ProphetReturn = {
    ds: number,
    y: number
}

export const getProphetProjections = async (
    data: number[],
    timeSeries: string[],
    frequency: 'D' | 'M' | 'W' | 'Y',
    periods: number,
): Promise<ProphetReturn[]> => {
    const projections: ProphetReturn[] = [];
    try {
        const prophetArray:{ds: string, y: number }[] = [];
        for (let i = 0; i < data.length; i++) {
            prophetArray.push({
                ds: timeSeries[i] as string,
                y: data[i] as number || 0,
            });
        }

        try {
            const response = await axios.post(PROPHET_API_URL, {
                periods: periods,
                freq: frequency,
                data: prophetArray,
            });

            if(response.data) {
                const jsonData = response.data as { data: string } 
                const json = JSON.parse(jsonData.data) as ProphetArrayResult;
                const keys = Object.keys(json.yhat);
                for(let i = 0; i < keys.length; i++) {
                    if(!keys[i]) continue
                    const key = keys[i] as string;
                    if(json.yhat[key] && json.ds[key]) {
                        projections.push({
                            ds: json.ds[key] as number,
                            y: json.yhat[key] as number,
                        });
                    }
                }
            }
            return projections;
        } catch (error) {
            return [];
        }

    } catch (error) {     
        console.log(error);
        return [];
    }
}

export const getProphetProjectionsReport = async (
    data: ExcelCell[][],
    periods: number,
    frequency: 'D' | 'M' | 'W' | 'Y',
): Promise<ExcelCell[][]> => {
    try {
        const dateHeader = data[0] as ExcelCell[];
        let updateHeader = false;
        if(!dateHeader) return [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i] as ExcelCell[]
            if(!row || !row?.length) continue;
            const prophetArray:{ds: string, y: number }[] = [];
            for(let j = 1; j < (data[i]?.length as number); j++) {
                prophetArray.push({
                    ds: dateHeader[j]?.value as string,
                    y: row[j]?.value as number || 0,
                });
            }
            try {
                const response = await axios.post(PROPHET_API_URL, {
                    periods: periods,
                    freq: frequency,
                    data: prophetArray,
                });
                if(response.data) {
                    const jsonData = response.data as { data: string } 
                    const json = JSON.parse(jsonData.data) as ProphetArrayResult;
                    const keys = Object.keys(json.yhat);
                    for(let k = 0; k < keys.length; k++) {
                        if(!keys[k]) continue
                        const key = keys[k] as string;
                        if(json.yhat[key]) {
                            row.push({
                                value: (json.yhat[key] as number).toFixed(2),
                            })
                        }
                        if(!updateHeader && json.ds[key]) {
                            const date = new Date(json.ds[key] as number);
                            date?.setDate(date.getDate() - 1);
                            dateHeader.push({
                                value: `Projection -${date.toDateString()}`
                            })
                        }
                    }
                    updateHeader = keys.length === periods;
                }
            } catch (error) {
                continue;
            }
        }
        return data

    } catch (error) {     
        console.log(error);
        return data;
    }
}