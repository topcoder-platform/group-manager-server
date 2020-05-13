const SQL = require('sql-bricks');
const SELECT = SQL.select;
const INSERT = SQL.insert;


class Model {
    
    constructor(conn) {
        this.conn = conn;
        this.schemaName = 'groupmanager';
    }

    createQualifiedTableName(tblName) {
        return `${this.schemaName}.${tblName}`;
    }

    populateTimestamps(values) {
        if(!values["created_at"]) {
            values["created_at"] = SQL('GETDATE()');
        }
        if(!values["updated_at"]) {
            values["updated_at"] = SQL('GETDATE()');
        }
    }

    async insert(tblName,values) {
        this.populateTimestamps(values);

        let sql = INSERT(this.createQualifiedTableName(tblName), values);
        console.log(sql.toParams().text)
        console.log(sql.toParams().values)

        return await this.conn.parameterizedQuery(sql.toParams().text, 
                        sql.toParams().values, {raw: true})
    }

    async findAll(tblName) {
        let sql = SELECT().from(this.createQualifiedTableName(tblName));
        return await this.conn.query(sql.toString(), {raw: true});
    }
}

module.exports = Model;