import { type ExcelCell } from "~/types/types";

export const removeEmptyColumns = (
    data: ExcelCell[][]
):ExcelCell[][] => {
    const dataCopy = [...data];
    let removedColumns = 0
    for(let i = 1; i < dataCopy.length; i++) {
        const column =  dataCopy.map((value) => value[i]);
        let hasValue = false;
        for(let j = 0; j < column.length; j++) {
            if(!column[j]) continue
            const value = parseInt(column[j]?.value as string);
            if(value !== 0 && value < Infinity && value > -Infinity) {
                hasValue = true;
                break;
            }
        }
        if(hasValue) {
            return data;
        } else {
            data = data.map(v => v.filter((_, index) => index !== i - removedColumns))
            removedColumns += 1;
        }
    }
    return data;
}
