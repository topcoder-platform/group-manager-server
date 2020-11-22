/**
 * Controller for payment endpoints
 * The main code that is responsible for handling all payment Requests
 */
const service = require('../services/PaymentService');
const paymentValidationService = require("../services/PaymentValidationService");
const logger = require('../common/logger');

/**
 * Get All Pending Requests previously submitted for connect Projects. Queries last 100
 * @param req the request
 * @param res the response
 */
async function getAllPayments(req, res) {
    logger.debug(`ENTER PaymentController.getAllPayments`);
    
    let allPayments = await service.getAllPayments();
    logger.debug(`EXIT PaymentController.getAllPayments`)
    res.send(allPayments);
}

/*
* Get a Single Challenge along with resources. 
   Query the Project Api and retrieve the project
* @param req the request
* @param res the response
*/
async function getChallenge(req, res) {
   logger.debug(`ENTER PaymentController.getChallenge - ${req.params.challengeId}`);
   
   let challenge = await service.getChallenge(req.params.challengeId);
   let challengeResource = await service.getChallengeResource(req.params.challengeId);
   
   let finalResponse = paymentValidationService.validateChallenge(challenge, challengeResource);

   logger.debug(`EXIT PaymentController.getChallenge`)
   res.send(finalResponse);
}

/**
 * Save the updated JSON for future processing by payment job
 * Updates Metadata and Status
 * @param req the request
 * @param res the response
 */
async function submitUpdate(req, res) {
    logger.debug(`ENTER PaymentController.submit Update...${JSON.stringify(req.body)}`);

    let result = await service.createSubmitRequest
      (req.params.challengeId, req.body, req.authUser.userId);

    logger.debug(`EXIT PaymentController.submit Update`)  
    res.send(result);
  }

  module.exports = {
    getAllPayments,
    getChallenge,
    submitUpdate
}