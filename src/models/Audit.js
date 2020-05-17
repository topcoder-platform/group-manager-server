const Model = require('./Model');
class Audit extends Model {

    constructor(conn, tblName) {
        super(conn);
        this.tblName = tblName;
    }

    async create(values) {
        return await this.insert(this.tblName, values);
    }
}

module.exports = Audit;