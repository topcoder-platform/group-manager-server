const _ = require('lodash')
const config = require('config')
const Joi = require('joi')

const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');

const db = require('../models');

async function getAllBulkImports() {
    logger.debug(`Bulk Import Service. Get All Imports`);
  
    try {
        return await db.BulkImport.getAll({
            columns: ["id","name","file_path","status","total","processed","error","message",
                "created_at","updated_at", "created_by"],
            limit: 100
        });
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

createBulkImport.schema = {
    name: Joi.string().required().max(255),
    location: Joi.string().required().max(2048),
    userId: Joi.number().integer().required()
}
  
async function createBulkImport(name, location, userId, email) {
    logger.debug(`Bulk Import Service. Insert one Import record`);
    try {
        let importRecord = {};
        importRecord.status = 'Submitted';
        importRecord.name = name;
        importRecord.file_path = location;
        importRecord.created_by = userId;
        
        await db.BulkImport.create(importRecord);
        const maxId = await db.BulkImport.getMaxId();
        logger.info(`Max Id: ${maxId}`);
        const notificationRecord = {
            bulk_import_id: maxId[0].max_id,
            email
        }

        logger.info(`Notification Record: ${notificationRecord}`);
        await db.BulkImportNotification.create(notificationRecord);

        return maxId[0].max_id;
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

module.exports = {
    getAllBulkImports,
    createBulkImport
}
  
logger.buildService(module.exports)