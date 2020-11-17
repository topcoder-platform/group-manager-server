const _ = require('lodash')
const config = require('config')
const Joi = require('joi')

const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');

const db = require('./../models');

function handleHttpError(e) {
    logger.debug(`Error In Http Call`);
    if (e.data) { 
        throw new errors.BadRequestError(e.data.message);
    }
    throw new errors.BadRequestError(e.message);
}
  
async function getAllProjects() {
    logger.debug(`Connect Service. Get All Connect Projects..`);
  
    try {
        return await db.Connect.getAll({
            columns: ["id","name","connect_id","status","created_at","updated_at"],
            limit: 100
        });
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

async function getProject(projectId) {
    logger.debug(`Connect Service. Get Project ${JSON.stringify(projectId)}`);

    logger.debug(`Enter get Project...`);
    const token = await utils.getM2MToken(); 
    logger.debug(`M2M Token Successful...${token}` );

    const httpClient = utils.getHttpClient();
    const endpoint = `${config.CONNECT_API_URL}/${projectId}/` ;
    const headers = utils.getHeaderParam(token);

    logger.debug(`Http call to enpoint ${endpoint}`);

    let connectResponse = null;

    try {
        connectResponse = await httpClient.get(endpoint, {
            headers: headers,
            timeout: config.DEFAULT_TIMEOUT
        })
    }
    catch(e) {
        handleHttpError(e.response);
        return null;
    }
    return connectResponse.data;
}

  /**
 * Update group
 * @param {String} groupId the id of group to update
 * @param {Object} groupBody the data to update group
 */
async function createSubmitRequest(projectId, projectBody, userId) {
  
    let dbConnectRecord = {};

    dbConnectRecord.connect_id = projectId;
    dbConnectRecord.status = 'Submitted';
    dbConnectRecord.name = projectBody.name;
    dbConnectRecord.details_update = JSON.stringify(projectBody);
    dbConnectRecord.created_by = userId;

    return await db.Connect.create(dbConnectRecord);
}

module.exports = {
  getAllProjects,
  getProject,
  createSubmitRequest
}
  
logger.buildService(module.exports)