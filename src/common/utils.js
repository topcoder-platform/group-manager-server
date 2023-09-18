const _ = require('lodash');
const errors = require('../common/errors');
const config = require('config')

const tcCoreLibAuth = require('tc-core-library-js').auth;
const util = _.cloneDeep(require('tc-core-library-js').util(config));
const m2m = tcCoreLibAuth.m2m(config);

const empty_response = { 
    "user.email": "Not found",
    "user.handle": "Not found",
    "user.status": "Not found",
    "user.first_name": "Not found",
    "user.last_name": "Not found"
}

/**
 * Common method to generate M2M token for all services.
 */
async function getM2MToken() {  
    return m2m.getMachineToken(config.M2M_CLIENT_ID, config.M2M_CLIENT_SECRET);      
}

/**
 * Get Http Client for all services
 */
function getHttpClient() {
    return util.getHttpClient();
}

/**
 * @param {token} M2M token that is to be set in the authorization parameter
 */
function getHeaderParam(token) {
    return  {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
} 

/**
 * 
 * @param {JSON} response Default Member API response, justify it to match the looker response
 * to ensure the downline code works properly
 */
function standardizeMemberAPIResponse(response) {
    let content = response;
   
    if (!_.isArray(content)) {
        return empty_response;
    }
    //if empty, the user is not resolved
    if (content.length == 0) {
        return empty_response;
    }

    // Make the response standard as per looker
    return {
        "user.coder_id": content[0].userId,
        "user.email": content[0].email,
        "user.handle": content[0].handle,
        "user.status": content[0].status,
        "user.first_name": content[0].firstName,
        "user.last_name": content[0].lastName
    }
}

module.exports = {
    standardizeMemberAPIResponse,
    getM2MToken,
    getHttpClient,
    getHeaderParam
}