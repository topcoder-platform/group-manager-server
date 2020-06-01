const _ = require('lodash')
const config = require('config')
const Joi = require('joi')

const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');

const db = require('./../models');


async function getAllBatches() {
    logger.debug(`Batch Service. Get All Batches`);
  
    try {
        return await db.Batch.getAll({
            columns: ["id","status","total","processed","errors","created_at","updated_at"],
            limit: 10
        });
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

createBatch.schema = {
    emails: Joi.string().required().max(65000),
    userId: Joi.number().integer().required()
}
  
async function createBatch(emails, userId) {
    logger.debug(`Batch Service. Insert one Batch`);
    try {
        let batchRecord = {};
        batchRecord.status = 'Not Started';
        batchRecord.emails = emails;
        batchRecord.operation = 'Deactivate';
        batchRecord.created_by = userId;

        return await db.Batch.create(batchRecord);
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

module.exports = {
    getAllBatches,
    createBatch
}
  
logger.buildService(module.exports)