/***********************************
 * Represent the redshift connection class
 ************************************/
const config = require("config");
const Redshift = require('node-redshift');
const Audit = require("./Audit");

let connConfig = {
  connectionString: config.DB_MASTER_URL
}

const db = new Redshift(connConfig);
const audit = new Audit(db, 'audit');

db.Audit = audit;

module.exports = db;