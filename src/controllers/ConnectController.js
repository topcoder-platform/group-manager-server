/**
 * Controller for connect endpoints
 * The main code that is responsible for handling all connect Requests
 */
const service = require('../services/ConnectService');
const connectValidationService = require("../services/ConnectValidationService");
const logger = require('../common/logger');

/**
 * Get All Pending Requests previously submitted for connect Projects. Queries last 100
 * @param req the request
 * @param res the response
 */
async function getAllProjects(req, res) {
    logger.debug(`ENTER ConnectController.getConnectProject`);
    
    let allProjects = await service.getAllProjects();
    logger.debug(`EXIT ConnectController.getConnectProject`)
    res.send(allProjects);
}

/*
* Get a Single Project. Query the Project Api and retrieve the project
* @param req the request
* @param res the response
*/
async function getProject(req, res) {
   logger.debug(`ENTER ConnectController.getConnectProject - ${req.params.projectId}`);
   
   let result = await service.getProject(req.params.projectId);
   result = connectValidationService.validateConnect(result);

   logger.debug(`EXIT ConnectController.getConnectProject`)
   res.send(result);
}

/**
 * Save the updated JSON for future processing by batch job
 * Updates Metadata and Status
 * @param req the request
 * @param res the response
 */
async function submitUpdate(req, res) {
    logger.debug(`ENTER ConnectController.submit Update...${JSON.stringify(req.body)}`);

    let result = await service.createSubmitRequest
      (req.params.projectId, req.body, req.authUser.userId);

    logger.debug(`EXIT ConnectController.submit Update`)  
    res.send(result);
  }

  module.exports = {
    getAllProjects,
    getProject,
    submitUpdate
}