const _ = require('lodash');
const errors = require('../common/errors');
const cacheService = require('./CacheService');
const utils  = require('../common/utils'); 
const { create } = require('lodash');

function cleanChallengeResources(challengeResource) {
    
    if (challengeResource.result && challengeResource.result.content) {
        return validateChallengeResources(challengeResource.result.content);
    }
    return [];
}

function validateChallengeResources(resources) {
     
    let cleanResources =  [];

    _.forEach(resources, function(resource, index) {
        if (resource.role === "Copilot") {
            cleanResources.push(createSimplifieldResource(resource));
        }
        if (resource.role === "Submitter") {
            if (resource.submissions && resource.submissions.length > 0) {
                cleanResources.push(createSimplifieldResource(resource));
            }
        }
        if (resource.role === "Iterative Reviewer") {
            cleanResources.push(createSimplifieldResource(resource));
        }
        if (resource.role === "Reviewer") {
            cleanResources.push(createSimplifieldResource(resource));
        }
    });

    return cleanResources;
}

function createSimplifieldResource(inputResource) {
    let resource = {};
    resource.id = inputResource.id;
    resource.role = inputResource.role;

    if (inputResource.properties) {
      resource.handle = inputResource.properties["Handle"];
      resource.userId = inputResource.properties["External Reference ID"];      
    }
    return resource;
}

function cleanChallenge(challenge) {
    let bareChallenge = {};
    
    //throw error if content is not there
    if (challenge.result && challenge.result.content) {
        let challengeContent = challenge.result.content;

        bareChallenge.id = challengeContent.challengeId;
        bareChallenge.name = challengeContent.challengeTitle;  
    }
    return bareChallenge;
}

function validateChallenge(challenge, challengeResource) {
    const challengeResponse = cleanChallenge(challenge);
    challengeResponse.resources =  cleanChallengeResources(challengeResource);

    return challengeResponse;
}

module.exports = {
    validateChallenge
}