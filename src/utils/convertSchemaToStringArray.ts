type Schema = { 
    table_name: string;
    column_name: string;
    data_type: string;
}

export const convertSchemaToStringArray = (rows: Schema[]) => {
    const tableArray = [];
    const tableDict: { [id: string]: [string] } = {}
    for (let i = 0; i < rows.length; i++) {
        const row: Schema = rows[i] as Schema;            
        if(!tableDict[row.table_name]) {
            tableDict[row.table_name] = [row.column_name];
        } else {
            tableDict[row.table_name]?.push(row.column_name);
        }
    }
    for (let i = 0; i < Object.keys(tableDict).length; i++) {
        const tableName = Object.keys(tableDict)[i];
        const columns = tableDict[String(tableName)];
        if(!columns) {
            continue
        }
        let tableString = `${String(tableName)}(${String(columns[0])}, `;
        for (let j = 1; j < columns.length; j++) {
            tableString += `${String(columns[j])}, `
        }
        tableString = tableString.slice(0, -2);
        tableString += ')\n';
        tableArray.push(tableString);
    }
    return tableArray
}