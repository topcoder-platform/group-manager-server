const config = require('config')
const helper = require('../common/helper');
const logger = require('../common/logger');
const errors = require('../common/errors');

const awsUtils = require('../common/awsUtils');

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
    
    logger.debug("Uploaded file Details....");
    logger.debug(JSON.stringify(req.file));

    //If the user hasn't provided any name, we use the original file name
    if(!req.body.name) {
        req.body.name = req.file.originalname;
    }

    logger.debug("Uploading files to S3");
    const awsResponse = await awsUtils.uploadToS3(req.file.originalname, req.file.path);
    logger.debug(awsResponse);

    logger.debug("Create Record in Group Manager table for processing...");
    let createImportResponse = await service.createBulkImport(req.body.name, awsResponse.Location, req.authUser.userId);

    logger.debug('EXIT BulkImportController.createBulkImport');
    res.send(createImportResponse);
}

module.exports = {
    getAllBulkImports,
    createBulkImport
}