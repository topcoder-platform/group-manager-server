const config = require('config')
const helper = require('../common/helper');
const logger = require('../common/logger');
const errors = require('../common/errors');

const service = require('../services/BulkImportService');

/**
 * Get Top 100 Imports
 */
async function getAllBulkImports (req, res) {
    logger.debug(`ENTER BulkImportController.getAllBulkImport`);
    let allImports = await service.getAllBulkImports();
    
    logger.debug(`EXIT ImportController.getAllBulkImport`);
    res.send(allImports);
}

/**
 * Create Import
 * @param req the request, request.body contains the import details
 * @param res the response
 */
async function createBulkImport (req, res) {
    logger.debug(`ENTER BulkImportController.createBulkImport...${JSON.stringify(req.body)}`);
    let createImportResponse = await service.createBulkImport(req.body.name, req.authUser.userId);

    logger.debug('EXIT BulkImportController.createBulkImport');
    res.send(createImportResponse);
}

module.exports = {
    getAllBulkImports,
    createBulkImport
}