const config = require('config')
const helper = require('../common/helper');
const logger = require('../common/logger');
const errors = require('../common/errors');

const service = require('../services/BatchService');

/**
 * Get Top 10 Batches
 */
async function getAllBatches (req, res) {
    logger.debug(`ENTER BatchController.getAllBatches`);
    let allBatches = await service.getAllBatches();
    
    logger.debug(`EXIT BatchController.getAllBatches`);
    res.send(allBatches);
}

/**
 * Create Batch
 * @param req the request, request.body contains the batch details
 * @param res the response
 */
async function createBatch (req, res) {
    logger.debug(`ENTER BatchController.createBatch...${JSON.stringify(req.body)}`);
    let createBatchResponse = await service.createBatch(req.body.emails, req.authUser.userId);

    logger.debug('EXIT BatchController.createBatch');
    res.send(createBatchResponse);
}

module.exports = {
    getAllBatches,
    createBatch
}