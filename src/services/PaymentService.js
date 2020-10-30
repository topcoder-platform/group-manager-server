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
  
async function getAllPayments() {
    logger.debug(`Payment Service. Get All Payment Projects..`);
  
    try {
        return await db.Payment.getAll({
            columns: ["id","name","challenge_id","status","created_at","updated_at"],
            limit: 100
        });
    }
    catch (error) {
        logger.error(error)
        throw new errors.ServiceUnavailableError(error);
    }
}

async function getChallengeResource(challengeId) {
    logger.debug(`Payment Service. Get Challenge Resource ${JSON.stringify(challengeId)}`);

    logger.debug(`Enter get Challenge Resource...`);
    const token = await utils.getM2MToken(); 
    logger.debug(`M2M Token Successful...${token}` );

    const httpClient = utils.getHttpClient();
    const endpoint = `${config.CHALLENGE_API_URL}/${challengeId}/resources` ;
    const headers = utils.getHeaderParam(token);
    
    logger.debug(`Http call to enpoint ${endpoint}`);

    let challengeResourceResponse = null;
    
    try {
        challengeResourceResponse = await httpClient.get(endpoint, {
            headers: headers,
            timeout: config.DEFAULT_TIMEOUT
        })
    }
    catch(e) {
        handleHttpError(e.response);
    }
    return challengeResourceResponse.data;
    
}

async function getChallenge(challengeId) {
    logger.debug(`Payment Service. Get Challenge ${JSON.stringify(challengeId)}`);

    logger.debug(`Enter get Challenge...`);
    const token = await utils.getM2MToken(); 
    logger.debug(`M2M Token Successful...${token}` );

    const httpClient = utils.getHttpClient();
    const endpoint = `${config.CHALLENGE_API_URL}/${challengeId}` ;
    const headers = utils.getHeaderParam(token);
    
    logger.debug(`Http call to enpoint ${endpoint}`);

    let challengeResponse = null;

    try {
        challengeResponse = await httpClient.get(endpoint, {
            headers: headers,
            timeout: config.DEFAULT_TIMEOUT
        })
    }
    catch(e) {
        handleHttpError(e.response);
    }
    return challengeResponse.data;
}

  /**
 * Create Challenge Payment change request
 * @param {String} challengeId the id of challenge to insert
 * @param {Object} challengeBody the data to insert 
 */
async function createSubmitRequest(challengeId, challengeBody, userId) {
  
    let dbPaymentRecord = {};

    dbPaymentRecord.challenge_id = challengeId;
    dbPaymentRecord.status = 'Submitted';
    dbPaymentRecord.name = challengeBody.name;
    dbPaymentRecord.details_update = JSON.stringify(challengeBody);
    dbPaymentRecord.created_by = userId;

    return await db.Payment.create(dbPaymentRecord);
}

module.exports = {
  getAllPayments,
  getChallenge,
  getChallengeResource,
  createSubmitRequest
}
  
logger.buildService(module.exports)