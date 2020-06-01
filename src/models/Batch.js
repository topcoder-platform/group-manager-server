const Model = require('./Model');
class Batch extends Model {

    constructor(conn, tblName) {
        super(conn);
        this.tblName = tblName;
    }

    async create(values) {
        return await this.insert(this.tblName, values);
    }

    async getAll(option) {
        let columns = option.columns;
        let orderBy = option.orderBy;
        let limit = option.limit;

        orderBy = orderBy ? orderBy : "created_at DESC";
        limit = limit ? limit : 10;

        return await this.findAll(this.tblName, columns, orderBy, limit);
    }
}

module.exports = Batch;