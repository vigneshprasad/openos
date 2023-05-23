type Schema = { 
    table_name: string;
    column_name: string;
    data_type: string;
}

type MySQLSchema = { 
    TABLE_NAME: string;
    COLUMN_NAME: string;
    DATA_TYPE: string;
}

export const convertPostgresSchemaToStringArray = (rows: Schema[]) => {
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

export const convertMySQLSchemaToStringArray = (rows: MySQLSchema[]) => {
    const tableArray = [];
    const tableDict: { [id: string]: [string] } = {}
    for (let i = 0; i < rows.length; i++) {
        const row: MySQLSchema = rows[i] as MySQLSchema;
        console .log(row.TABLE_NAME);     
        if(!tableDict[row.TABLE_NAME]) {
            tableDict[row.TABLE_NAME] = [row.COLUMN_NAME];
        } else {
            tableDict[row.TABLE_NAME]?.push(row.COLUMN_NAME);
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