const Model = require('./Model');
class Import extends Model {

    constructor(conn, tblName) {
        super(conn);
        this.tblName = tblName;
    }

    async create(values) {
        return this.insert(this.tblName, values);
    }
}

module.exports = Import;