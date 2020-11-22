/***********************************
 * Represent the redshift connection class
 ************************************/
const config = require("config");
const Redshift = require('node-redshift');
const Audit = require("./Audit");
const Batch = require('./Batch');
const Connect = require("./Connect");
const Payment = require('./Payment');

let connConfig = {
  connectionString: config.DB_MASTER_URL
}

const db = new Redshift(connConfig);
const audit = new Audit(db, 'audit');
const batch = new Batch(db, 'batch');
const connect = new Connect(db, 'connect');
const payment = new Payment(db, 'payment_adjustment');


db.Audit = audit;
db.Batch = batch;
db.Connect = connect;
db.Payment = payment;

module.exports = db;