/**
 * This service provides operations of groups
 */

 //https://github.com/appirio-tech/tc-core-library-js/blob/master/lib/auth/m2m.js
 //https://github.com/topcoder-platform/tc-project-service/blob/dev/src/util.js

const _ = require('lodash')
const config = require('config')

const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils');

const constants = require('../../app-constants');

// ================================= Async functions ===================//

function handleHttpError(e) {
  logger.debug(`Error In Http Call`);
  if (e.data) { 
    throw new errors.BadRequestError(e.data.message);
  }
  throw new errors.BadRequestError(e.message);
}

async function getGroup(groupId) {
  logger.debug(`Group Shim Service. Get Group ${groupId}`);

  let token = await utils.getM2MToken();
  logger.debug(`M2M Token Successful...`);

  const httpClient = utils.getHttpClient();

  const endpoint = `${config.GROUP_API_URL}/${groupId}` ;
  const headers = utils.getHeaderParam(token);

  logger.debug(`Http call to enpoint ${endpoint}`);

  let groupResponse = null;
  
  try {
    groupResponse = await httpClient.get(endpoint, {
        headers: headers,
        timeout: config.DEFAULT_TIMEOUT
      })
  }
  catch(e) {
    handleHttpError(e.response);
  }
  return groupResponse.data;
  
}

async function getAllGroups(criteria) {
  logger.debug(`Group Shim Service. Get All Groups ${JSON.stringify(criteria)}`);

  let token = await utils.getM2MToken();
  logger.debug(`M2M Token Successful...`);
  
  //x-total-page contains the total number of pages
  //Make multiple requests to get all groups
  const httpClient = utils.getHttpClient();
  const endpoint = `${config.GROUP_API_URL}/${config.GROUP_WIPRO_ALL}` ;
  const headers = utils.getHeaderParam(token);

  logger.debug(`Http call to enpoint ${endpoint}`);

  let getAllGroupsResponse = null;
  
  try {
      getAllGroupsResponse = await httpClient.get(endpoint, {
        params: criteria,
        headers: headers,
        timeout: config.DEFAULT_TIMEOUT
      })
  }
  catch(e) {
    handleHttpError(e.response);
  }
  return getAllGroupsResponse.data;
}

/**
 * Create group.
 * @param {Object} currentUser the current user
 * @param {Object} data the data to create group
 * @returns {Object} the created group
 */
async function createGroup (groupBody) {
  logger.debug(`Enter Create Group...`);

  const token = await utils.getM2MToken(); 
  logger.debug(`M2M Token Successful...`);

  const httpClient = utils.getHttpClient();
  const headers = utils.getHeaderParam(token);
  const postData = groupBody;
  
  const endpoint = config.GROUP_API_URL;

  let groupCreateResponse = null;

  logger.debug(`Http...${endpoint}`);
  try {
    groupCreateResponse = await httpClient.post(endpoint, postData, {
      "headers": headers,
      "timeout": config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e.response);
  }

  if (groupCreateResponse && groupCreateResponse.data) {
    return groupCreateResponse.data;
  }
}

/**
 * Update group
 * @param {String} groupId the id of group to update
 * @param {Object} groupBody the data to update group
 */
async function updateGroup (groupId, groupBody) {
  
  logger.debug(`Enter Update Group...`);
  const token = await utils.getM2MToken(); 
  logger.debug(`M2M Token Successful...`);

  const httpClient = utils.getHttpClient();
  const headers = utils.getHeaderParam(token);
  
  let endpoint = `${config.GROUP_API_URL}/${groupId}`;
 
  logger.debug(`Http...${endpoint}`);
  try {
    result = await httpClient.put(endpoint, groupBody, { 
      "headers": headers,
      "timeout": config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e.response);
  }
  if (result && result.data) {
    return result.data;
  }

}

/**
 * Get group.
 * @param {Object} currentUser the current user
 * @param {String} groupId the id of group to get
 * @param {Object} criteria the query criteria
 * @returns {Object} the group
 NOT USED NOW
async function getGroup (currentUser, groupId, criteria) {
  logger.debug(`Get Group - user - ${currentUser} , groupId - ${groupId} , criteria -  ${JSON.stringify(criteria)}`);
  return standardResponse;
}
*/

async function addGroupMember (groupId, groupBody) {
  logger.debug(`add Group Member to groupId - ${groupId} , body -  ${JSON.stringify(groupBody)}`);
  
  const token = await utils.getM2MToken(); 
  const httpClient = utils.getHttpClient();

  let endpoint = `${config.GROUP_API_URL}/${groupId}/members`;
  const headers = utils.getHeaderParam(token);

  logger.debug(`Http...${endpoint}`);

  try {
    result = await httpClient.post(endpoint, groupBody,{ 
      "headers": headers,
      "timeout": config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e.response);
  }
  if (result && result.data) {
    return result.data;
  }
}

/**
 * Delete group member.
 * @param {Object} currentUser the current user
 * @param {String} groupId the group id
 * @param {String} memberId the member id
 * @returns {Object} the deleted group membership
 */
async function deleteGroupMember (groupId, memberId) {
  logger.debug(`delete Group Member groupId - ${groupId} , & memberId -  ${memberId}`);
  
  const token = await utils.getM2MToken(); 
  const httpClient = utils.getHttpClient();
  
  let endpoint = `${config.GROUP_API_URL}/${groupId}/members/${memberId}`;
  const headers = utils.getHeaderParam(token);

  try {
    result = await httpClient.delete(endpoint,{ 
      "headers": headers,
      "timeout": config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e.response);
  }
  if (result && result.data) {
    return result.data;
  }
}
  
/**
 * Get group members
 * @param {Object} currentUser the current user
 * @param {String} groupId the id of group to get members
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
async function getGroupMembers (groupId, page) {
  logger.debug(`get GroupMember groupId - ${groupId}`);
  
  let token = await utils.getM2MToken();

  //x-total-page contains the total number of pages
  // Make multiple requests to get all groups
  const httpClient = utils.getHttpClient();

  let endpoint = `${config.GROUP_API_URL}/${groupId}/members`;
  if (!page) {
    page = 1; //If no page is specified, we start from zero
  }
  endpoint = `${endpoint}?page=${page}&perPage=${constants.MEMBER_PAGE_SIZE}`

  const headers = utils.getHeaderParam(token);

  logger.debug(`Http...${endpoint}`);

  let result = null;
  try {
    result = await httpClient.get(endpoint, {
        headers: headers,
        timeout: config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e.response);
    return null;
  }

  if (result && result.data) {
    let totalMembers;
    if (result.headers && result.headers["x-total"]) {
       totalMembers = result.headers["x-total"]
    }
    return { total: totalMembers, data: result.data };
  }
}
  
  
/**
 * Get group member.
 * @param {Object} currentUser the current user
 * @param {String} groupId the group id
 * @param {String} memberId the member id
 * @returns {Object} the group membership
 NOT USED NOW
async function getGroupMember (currentUser, groupId, memberId) {
    return standardResponse; 
}
*/
  

/**
 * Get distinct user members count of given group. Optionally may include sub groups.
 * @param {String} groupId the group id
 * @param {Object} query the query parameters
 * @returns {Object} the group members count data
NOT USED NOW
async function getGroupMembersCount (groupId) {
  logger.debug(`get GroupMember Count - ${groupId}`);
  let token = await utils.getM2MToken();

  const httpClient = utils.getHttpClient();

  let endpoint = `${config.GROUP_API_URL}/${groupId}/membersCount?includeSubGroups=false`;
  const headers = utils.getHeaderParam(null);

  logger.debug(`Http...${endpoint}`);
  let result = null;

  try {
    result = await httpClient.get(endpoint, {
        headers: headers,
        timeout: config.DEFAULT_TIMEOUT
    });
  }
  catch(e) {
    handleHttpError(e);
  }

  if (result && result.data) {
    return result.data;
  }
  return null; 
}
 */

module.exports = {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  addGroupMember,
  deleteGroupMember,
  getGroupMembers
}

logger.buildService(module.exports)