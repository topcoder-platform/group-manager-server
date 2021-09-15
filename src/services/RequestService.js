const _ = require('lodash')
const config = require('config')
const Joi = require('joi')

const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');


const db = require('./../models');

async function getAllRequests(requestType) {
    logger.debug(`Request Service. Get All Request => ${requestType}`);
    try {
        return await db.Request.getFiltered({
            columns: ["id", "name", "status", "total", "processed", "errors", "created_at", "updated_at"],
            limit: 100
        }, requestType);
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}


async function createRequest(request_type, userId, inputRequest) {
    logger.debug(`Request Service. Insert one request`);
    try {
        let request = {};
        request.status = 'Submitted';
        request.name = inputRequest.name;
        request.request_type = request_type;
        request.details = inputRequest.details;
        request.common = JSON.stringify(inputRequest.common);
        request.created_by = userId;

        return await db.Request.create(request);
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

module.exports = {
    getAllRequests,
    createRequest
}

logger.buildService(module.exports)