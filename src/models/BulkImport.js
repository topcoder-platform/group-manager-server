const Model = require('./Model');
class Import extends Model {

    constructor(conn, tblName) {
        super(conn);
        this.tblName = tblName;
    }

    async create(values) {
        return await this.insert(this.tblName, values);
    }

    async getMaxId() {
        let sql = `SELECT MAX(id) AS max_id FROM ${this.schemaName}.${this.tblName}`;
        return await this.conn.query(sql, {raw: true});
    }

    async getAll(option) {
        let columns = option.columns;
        let orderBy = option.orderBy;
        let limit = option.limit;

        orderBy = orderBy ? orderBy : "created_at DESC";
        limit = limit ? limit : 100;

        return await this.findAll(this.tblName, columns, orderBy, limit);
    }
}

module.exports = Import;