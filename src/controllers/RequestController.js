const config = require('config')
const helper = require('../common/helper');
const logger = require('../common/logger');
const errors = require('../common/errors');

const service = require('../services/RequestService');
const validationService = require("../services/RequestValidationService");

/**
 * Bulk Request get all requests based on filter
 */
async function getAllRequests (req, res) {
    logger.debug(`ENTER RequestController.getAllRequests..`);
    let requestType = '';

    if (req.query.type) {
        requestType = req.query.type;
    }
    requestType = validationService.validateRequestType(requestType);
    let allRequests = await service.getAllRequests(requestType);

    logger.debug(`EXIT RequestController.getAllRequests`);
    res.send(allRequests);
}

/**
 * Create a new database request for some processing
 * @param req the request, request.body contains the batch details
 * @param res the response
 */
async function createRequest (req, res) {
    logger.debug(`ENTER RequestController.createRequest...${JSON.stringify(req.body)}`);
    
    let requestType = '';
    if (req.query.type) {
        requestType = req.query.type;
    }

    requestType = validationService.validateRequestType(requestType);
    validationService.validateRequest(requestType, req.authUser, req.body);


    let createRequestResponse = 
     await service.createRequest(requestType,req.authUser.userId, req.body);

    logger.debug('EXIT RequestController.createRequest');
    res.send(createRequestResponse);
}

module.exports = {
    getAllRequests,
    createRequest
}