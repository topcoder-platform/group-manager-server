/***********************************
 * Represent the redshift connection class
 ************************************/
const config = require("config");
const Redshift = require('node-redshift');
const Audit = require("./Audit");
const Batch = require('./Batch');

let connConfig = {
  connectionString: config.DB_MASTER_URL
}

const db = new Redshift(connConfig);
const audit = new Audit(db, 'audit');
const batch = new Batch(db, 'batch');

db.Audit = audit;
db.Batch = batch;

module.exports = db;