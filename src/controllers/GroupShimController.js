/**
 * Controller for group shim endpoints
 * The main code that is responsible for handling all Requests
 */
const config = require('config')
const service = require('../services/GroupShimService');
const groupValidationService = require("../services/GroupValidationServices");
const cacheService = require("../services/CacheService");
const helper = require('../common/helper');
const logger = require('../common/logger');
const errors = require('../common/errors');


/**
 * Get All Groups. Groups can be loaded from server cache or directly via the API
 * @param req the request
 * @param res the response
 */
async function getAllGroups (req, res) {
  logger.debug(`ENTER GroupShimController.getAllGroups - ${req.query.refresh}`);

  const isRefresh = req.query.refresh
  let result = null //All Groups Result

  //By default try to load from cache if isRefresh parameter is not set
  if (!isRefresh) {
    result = await cacheService.getAllGroups_Response(); 
  }

  if (result) {
    logger.debug(`Results found in cache`);
  }
  else {
    logger.debug(`Groups API Initiated`);
    result = await loadGroupsAndCache();
  }
  logger.debug(`EXIT GroupShimController.getAllGroups`)
  res.send(result);
}

async function loadCacheIfEmpty() {
  logger.debug(`ENTER GroupShimController.loadCacheIfEmpty`);
  const result = await cacheService.getAllGroups_Response(); 
  if (result) {
    return;
  }
  logger.debug(`EXIT GroupShimController.loadCacheIfEmpty`);
  return loadGroupsAndCache();
}

async function loadGroupsAndCache() {
  logger.debug(`ENTER GroupShimController.loadGroupsAndCache`);
  cacheService.flush_Group_Cache();
  let criteria = {
    includeSubGroups: true
  }

  //The result is returned as subGroups inside subGroups
  let result = await service.getAllGroups(criteria);
  result = helper.flattenGroupResult(result);

  await cacheService.setAllGroups_Response(result);
  logger.debug(`ENTER GroupShimController.loadGroupsAndCache`);
  return result;
}

/**
 * Create group
 * @param req the request, request.body contains the group details
 * @param res the response
 */
async function createGroup (req, res) {
    logger.debug(`ENTER GroupShimController.createGroup...${JSON.stringify(req.body)}`);
    const group = groupValidationService.createGroup(req.body);
    groupValidationService.validateGroup(req.authUser, group);

    //Add the additional parameters required by group service
    group.privateGroup = true; //This should be true
    group.selfRegister = false; 

    const groupApiResponse = await service.createGroup(group);
    logger.debug(`Group Api Response ${JSON.stringify(groupApiResponse)}`);

    //TODO: Validate the group Id should be a part of Wipro 
    const parentGroupId = (req.params.groupId ? req.params.groupId : config.GROUP_WIPRO_ALL);
    
    const groupCreatorId = req.body.addSelf ? req.authUser.userId : null;
   
    await addDefaultMembers(groupApiResponse, parentGroupId, groupCreatorId);
    
    await loadGroupsAndCache();

    //Append the property childGroupIds, to make it consistent with get All Group response
    groupApiResponse.childGroupIds = [];
    logger.debug(`EXIT GroupShimController.createGroup...`)
    res.send(groupApiResponse);
}

async function addDefaultMembers(group, parentGroupId, userId) {
  logger.debug(`ENTER GroupShimController.addDefaultMembers`)
  // Add the group under Parent Group
  await service.addGroupMember(parentGroupId, 
      helper.createGroupMembershipGroup(group.id));

  let defaultUsers = helper.extractDefaultUsers(config.GROUP_DEFAULT_USERS)
  // If current user is provided add him to the group as well.
  if (userId) {
    defaultUsers.push(userId);
  }    

  for(let i = 0; i < defaultUsers.length; i++) {
    const userId = defaultUsers[i];
    logger.debug('Adding default Users...' + userId);

    const groupMembershipBody = helper.createGroupMembershipUser(userId)
    const groupMembershipResult = await service.addGroupMember(group.id, 
      groupMembershipBody);
    
    logger.debug(`Default Group Membership Api Response ${JSON.stringify(groupMembershipResult)}`);  
  }
  logger.debug(`EXIT GroupShimController.addDefaultMembers`)
 }

/**
 * Update group
 * @param req the request
 * @param res the response
 */
async function updateGroup (req, res) {
  logger.debug(`ENTER GroupShimController.updateGroup...${JSON.stringify(req.body)}`);
  
  const group = groupValidationService.createGroup(req.body);
  groupValidationService.validateGroup(req.authUser, group);
  let parentGroup = groupValidationService.isParentGroupExists(req.body);

  //TODO: Fix this after 
  //Add the additional parameters required by group service 
  group.privateGroup = true; //This should be true
  group.selfRegister = false; 
  group.active = true;

  const result = await service.updateGroup(req.params.groupId, group);

  //If the parent group has been changed, validate both parent groups
  if (parentGroup) {
      const oldParentId = req.body.oldParentGroupId;
      const parentId = req.body.parentGroupId;

      let previousGroup = cacheService.isGroupExists(oldParentId);
      let newGroupId = cacheService.isGroupExists(parentId);
      
      if (!previousGroup || !newGroupId) {
        throw  new errors.BadRequestError("Both Old Parent Group Id and New Parent Group Id should be Wipro");
      }
      addRemoveParent(oldParentId, parentId, req.params.groupId);
  }
  await loadGroupsAndCache();
  logger.debug(`EXIT GroupShimController.updateGroup`);
  res.send(result);
}

async function addRemoveParent(oldGroupId, newGroupId, memberId) {
   await service.deleteGroupMember(oldGroupId, memberId);
   await service.addGroupMember(newGroupId, memberId);
}

/**
 * Get group
 * @param req the request
 * @param res the response
 NOT USED
async function getGroup (req, res) {
  logger.debug(`Get group details for req = ${req}`)
  const result = await service.getGroup('M2M', req.params.groupId, req.query)
  res.send(result)
}*/

/**
 * Get group members
 * @param req the request
 * @param res the response
 */
async function getGroupMembers (req, res) {
    logger.debug(`ENTER GroupShimController.getGroupMember Group Id - ${JSON.stringify(req.params.groupId)}`)

    //If this first call, we load all groups
    await loadCacheIfEmpty()

    groupValidationService.validateWiproGroup(req.params.groupId);
    logger.debug('Group validation successful');

    const result = await service.getGroupMembers(
      req.params.groupId,
      req.query.page
    )
   
    logger.debug(`Filter out Users and Groups`);
   
    let groupMemberUsers = groupValidationService.filterGroupMembersByType(result.data, "user");  
    logger.debug(`${groupMemberUsers.length} - child users`);

    groupValidationService.appendUserIdField(groupMemberUsers);  
    await cacheService.getUsersByHandleOrEmail("user.coder_id", groupMemberUsers);

    logger.debug(` Group Members after appending details....${groupMemberUsers.length}`);  

    //Set the total number of members along with Access Control to allow browser api to read
    res.set('Access-Control-Expose-Headers','X-Total')
    res.set('x-total', result.total)

    logger.debug(`EXIT GroupShimController.getGroupMember`)
    res.send(groupMemberUsers)
  }
  
  /**
   * Add group member
   * @param req the request
   * @param res the response
   */
  async function addGroupMember (req, res) {
    logger.debug(`ENTER GroupShimController.addGroupMember...body = ${JSON.stringify(req.body)}, Params = ${JSON.stringify(req.params)}`)

    let groupArray = req.body;
    let identifier = req.params.identifier;
    if (!identifier) {
      throw new errors.BadRequestError('User Handle or Email or Child Group should be provided');
    }

    groupValidationService.validateWiproGroup(req.params.groupId);
    let groupMemberArray = []
    groupMemberArray = await addUserMembers(req.params.groupId, identifier, groupArray)
    
    logger.debug(`EXIT GroupShimController.addGroupMember`)
    res.send(groupMemberArray);
  }

  
  /**
   * Add Users to Groups using email or handle
   */
  async function addUserMembers(groupId, identifier, groupArray) {
    logger.debug(`ENTER GroupShimController.addUserMembers`)
    let groupMemberArray = groupValidationService.generateGroupMember(identifier, groupArray);

    logger.debug(`[${groupMemberArray.length}] - Call Cache Service to add details...${JSON.stringify(groupMemberArray)}`);
    groupMemberArray = await cacheService.getUsersByHandleOrEmail(identifier, groupMemberArray);

    logger.debug(`Group Member Array for creation ${JSON.stringify(groupMemberArray)}`)
    groupValidationService.validateAllGroupMembers(groupMemberArray);

    logger.debug('Group Member Array validation complete')

    for(let i = 0; i < groupMemberArray.length; i++) {
       let currentGroupMember = groupMemberArray[i];
       if (!currentGroupMember.isValid) {
        groupValidationService.removeAttributesForInvalidGroupMember(currentGroupMember, identifier); 
        continue;
       }
       try {
          let result = await callAddGroupMemberApi(groupId, currentGroupMember["user.coder_id"]);
          currentGroupMember.response = result;
        }
       catch(e) {
          currentGroupMember.isValid = false;
          currentGroupMember.response = e;
          if (e.message) {
            currentGroupMember.message = e.message;
          }
       }   
    }
    logger.debug(`EXIT GroupShimController.addUserMembers`)
    return groupMemberArray;
  } 

  async function callAddGroupMemberApi(groupId, userId) {
    logger.debug(`ENTER GroupShimController.callAddGroupMemberApi`)
    let body = helper.createGroupMembershipUser(userId);
    let result = await service.addGroupMember(groupId, body);
    
    logger.debug(`ENTER GroupShimController.callAddGroupMemberApi`)
    return result;
  }

  /**
   * Get group member
   * @param req the request
   * @param res the response
   NOT USED
  async function getGroupMember (req, res) {
    const result = await service.getGroupMember(
      req.params.groupId,
      req.params.memberId
    )
    res.send(result);
  }*/
  
  /**
   * Delete group member
   * @param req the request
   * @param res the response
   */
  async function deleteGroupMember (req, res) {
    logger.debug(`ENTER GroupShimController.deleteGroupMember...${JSON.stringify(req.params)}`)
    groupValidationService.validateWiproGroup(req.params.groupId);

    const result = await service.deleteGroupMember(
      req.params.groupId,
      req.params.memberId
    )
    logger.debug(`EXIT GroupShimController.deleteGroupMember...`);
    res.send(result);
  }
  
  /**
   * Get group members count
   * @param req the request
   * @param res the response
   NOT IN USE
  async function getGroupMembersCount (req, res) {
    const result = await service.getGroupMembersCount(
      req.params.groupId
    )
    res.send(result);
  } */

module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  getGroupMembers,
  addGroupMember,
  deleteGroupMember
}