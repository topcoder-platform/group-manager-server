// --https://discourse.looker.com/t/looker-api-run-inline-query-filters-how-to-pass-or-condition-and-date-filters/3639/4

const _ = require('lodash')
const config = require('config')
const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');

let lastToken = null;
let tokenExpiration = null;

async function getLookerToken() {
    if (isTokenExpired()) {
        await loginToLooker();
    }
    return Promise.resolve(lastToken);
}

function getTokenExpirationTime(expiresIn) {
    let date = new Date(); //Current Date;

    //Reduce the expiration time by 5 minutes to allow queries to execute
    let newTime = date.getTime() + ((expiresIn - 300) * 1000); 
    return date.setTime(newTime);
}

function isTokenExpired() {
    //if last Token and token Expiration time both are populated
    if (lastToken && tokenExpiration) {

        // If token expiration time has not reached, token has not expired
        if (new Date().getTime() < tokenExpiration) {
            return false;
        }
    }
    // If values are not populated assume token has expired
    return true;
}
/**
 * Base Model JSON that is required for all queries in Looker
 */
function getBaseModel(column, valueArr) {
    let base =  {
        "model":"topcoder_model_main",
        "view":"user",
        "fields":[  "user.coder_id",
                    "user.first_name",
                    "user.last_name",  
                    "user.handle",
                    "user.handle_lower",
                    "user.status",
                    "user.email"],
        "filters":{},
        "limit":"500",
        "query_timezone":"America/Los_Angeles"
    };

    //Remove blank values, and trim extra spaces
    let values = _.compact(_.map(_.join(valueArr, ","), _trim));
    base.filters[column] = `${values}`;
    return base;
}

/******************************************* *************************/
async function getUsers(column, columnValueArr) {
    logger.debug(`ENTER LookerService.getUsers for ${JSON.stringify(column)}`)

    //Check if Looker User ID and LOOKER_CLIENT_SECRET configured if not 
    //skip the looker call
    if (!config.LOOKER_CLIENT_ID || !config.LOOKER_CLIENT_SECRET) {
        logger.debug('Looker Client ID is not configured. Skip...')
        return [];
    }

    const token = await getLookerToken();
    logger.debug(`Looker Token received...`);

    const httpClient = utils.getHttpClient();
    const body = getBaseModel(column, columnValueArr);

    logger.debug(`Initiate Http Call with Base Model ${JSON.stringify(body)}`);

    const lookerResponse = await httpClient.post(`${config.LOOKER_END_POINT}/queries/run/json`, 
        body,
        {  
            "headers": utils.getHeaderParam(token),
            "timeout": config.LOOKER_SERVICE_TIMEOUT
        }
    );
    logger.debug('EXIT LookerService.getUsers')
    return lookerResponse.data;
}

async function loginToLooker() {
    logger.debug(`ENTER LookerService.loginToLooker...`)
    const httpClient = utils.getHttpClient();
    const endpoint = `${config.LOOKER_END_POINT}/login?` +
                      `client_id=${config.LOOKER_CLIENT_ID}&` + 
                      `client_secret=${config.LOOKER_CLIENT_SECRET}`;

    logger.debug(`Initiate Looker Login Call...`);                  
    const lookerResponse = await httpClient.post(endpoint, null, {
        "timeout": config.LOOKER_SERVICE_TIMEOUT}
    );
    logger.debug(`Looker Login Successful`);
    if (lookerResponse.data && lookerResponse.data.access_token) {
        lastToken = lookerResponse.data.access_token;
        lastTokenTime = getTokenExpirationTime(lookerResponse.data.expires_in * 1000);
    }
    else {
        throw new errors.ServiceUnavailableError("Error in Login..Looker Service is not available");
    }
    logger.debug(`EXIT LookerService.loginToLooker...`)
}


module.exports = {
    getUsers    
}
