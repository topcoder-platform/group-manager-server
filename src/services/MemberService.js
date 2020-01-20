const _ = require('lodash')
const config = require('config')
const logger = require('../common/logger');
const utils = require('../common/utils');

async function queryUserByMemberService(field, fieldValue) {

    logger.debug(`ENTER MemberService.queryUserByMemberService...`);
    let dbFieldName = (field === "user.coder_id" ? "id": field);
   
    let token = await utils.getM2MToken();
    logger.debug(`M2M Token Successful...`);
    
    const httpClient = utils.getHttpClient();
    const criteria = {
        "fields":"id,handle,email,status,firstName,LastName",
        "filter": `${dbFieldName}=${fieldValue}`
    }
    logger.debug(`Field Name = ${dbFieldName}=${fieldValue}`)
    logger.debug(`Initiate Http Call...`);
  
    const memberAPIResponse = await httpClient.get(config.MEMBER_API_URL, {
      params: criteria,
      headers: utils.getHeaderParam(token),
      "timeout": config.MEMBER_SERVICE_TIMEOUT
    })
  
    logger.debug(`EXIT MemberService.queryUserByMemberService ${JSON.stringify(memberAPIResponse.data)}`);
    return memberAPIResponse.data;
  }

module.exports = {
    queryUserByMemberService
}