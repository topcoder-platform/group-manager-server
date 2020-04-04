const _ = require('lodash')
const logger = require('../common/logger');
const errors = require('../common/errors');
const utils = require('../common/utils');

const lookerService = require('./LookerService');
const memberService = require('./MemberService');

// Store data in cache
const cache_handle = {};
const cache_email = {};
const cache_userId = {};
let cache_groups = {};
let cache_groups_All = undefined;

async function getAllGroups_Response() {
    return cache_groups_All;
}

async function flush_Group_Cache() {
    cache_groups_All = undefined;
    cache_groups = {};
}

async function setAllGroups_Response(response) {
    logger.debug('ENTER CacheService.setAllGroups_Response')
    cache_groups_All = response;
    const clonedResponse = _.cloneDeep(response);
    populateGroups(clonedResponse);
    
    logger.debug(`Cache Entries Count - [${_.keys(cache_groups).length}]`);
    logger.debug('EXIT CacheService.setAllGroups_Response')
}

function populateGroups(response) {
    _.forEach(response, function(parentGroup) {
        cache_groups[parentGroup.id] = parentGroup;
    });
}

function isGroupExists(groupId) {
    const group = cache_groups[groupId]
    if (group) return true;    
    return false;
}

async function getUsersByHandleOrEmail(handleOrEmail, groupUsers) {
    logger.debug(`ENTER CacheService.getUsersByHandleOrEmail - ${handleOrEmail} for [${groupUsers.length}]`);
    let notFoundInCache = await findUsersInCache(handleOrEmail, groupUsers);
    
    // All users have been found in cache
    if (notFoundInCache.length == 0) {
        logger.debug('EXIT CacheService.getUsersByHandleOrEmail All users found in Normal cache...')
        return Promise.resolve(groupUsers);
    }

    logger.debug(`[${notFoundInCache.length}] cache misses - Values ${JSON.stringify(notFoundInCache)}`);

    /*
    //Step 2. Load Users from Looker
    logger.debug(`Query Looker - ${handleOrEmail}`);
    await queryLooker(handleOrEmail, notFoundInCache);
    let notFoundInLooker = await findUsersInCache(handleOrEmail, groupUsers);

    if (notFoundInLooker.length == 0) {
        logger.debug('EXIT CacheService.getUsersByHandleOrEmail All users found in Looker...')
        return Promise.resolve(groupUsers);
    }
    logger.debug(`[${notFoundInLooker.length}] looker misses - Values ${JSON.stringify(notFoundInLooker)}`);
    */
   
    // Step 3. Load Users from Member Service
    // Last and final try
    await queryMemberService(handleOrEmail, notFoundInLooker);
    let notFoundAtAll = await findUsersInCache(handleOrEmail, groupUsers);

    logger.debug(`[${notFoundAtAll.length}] member service misses - Values ${JSON.stringify(notFoundAtAll)}`);
    logger.debug('EXIT CacheService.getUsersByHandleOrEmail')

    return Promise.resolve(groupUsers);
}

async function findUsersInCache(handleOrEmail, groupUsers) {
    logger.debug(`ENTER CacheService.findUsersInCache  ${handleOrEmail}`);
    let fieldName = findFieldNameByColumn(handleOrEmail);

    logger.debug(`..Search with - ${fieldName}`);
    let cacheMissArr = [];

    _.forEach(groupUsers, function(groupUser) {
        if (groupUser.resolved) {
            return; 
        }
        let handleEmailValue = groupUser[fieldName];
        let user = findUser(handleOrEmail, handleEmailValue);

        if (user) {
            Object.assign(groupUser, user);
            groupUser.resolved = true;
        }
        else {
            cacheMissArr.push(handleEmailValue);
        }
    });
    logger.debug(`EXIT CacheService.findUsersInCache`);
    return cacheMissArr;
}

async function queryLooker(column, unresolvedUsers) {
    logger.debug(`ENTER CacheService.queryLooker`)
    const fieldName = findFieldNameByColumn(column);
    const lookerResult = await lookerService.getUsers(fieldName, unresolvedUsers);
    
    _.forEach(lookerResult, function(record) {
       addRecordToCache(record);
    });
    logger.debug(`EXIT CacheService.queryLooker`)   
}

function addRecordToCache(record) {
    //If coder is not present do not add to cache
    //It can happen, if the user is not resolved, despite the best efforts or error in 
    //handle or email
    if (!record["user.coder_id"]) {
        return;
    }

    cache_userId[record["user.coder_id"]] = record; //Store by Id
    //Convert both email and handle to lowercase
    cache_email [record["user.email"].toLowerCase()] = record;
    cache_handle[record["user.handle"].toLowerCase()] = record;
}

async function queryMemberService(column, unresolvedUsers) {
    logger.debug(`ENTER CacheService.queryMemberService`)
    for(let i = 0; i < unresolvedUsers.length; i++) {
        let currentValue = unresolvedUsers[i];
        let memberResponse = await memberService.queryUserByMemberService(column, currentValue);
        
        addRecordToCache(utils.standardizeMemberAPIResponse(memberResponse));
    }
    logger.debug(`EXIT CacheService.queryMemberService`)
}

function findFieldNameByColumn(column) {

    if (column == "userId") {
        return "user.coder_id";
    }
    if (column == "email") {
        return "user.email";
    }
    if (column == "handle") {
        return "user.handle";
    }
    return column;
}

function findUser(column, value) {
    let cache = null;
    if (column === "id" || column === "user.coder_id") {
        cache = cache_userId;
    }
    if (column === "email" || column === "user.email") {
        cache = cache_email;
    }
    if (column === "handle" || column === "user.handle") {
        cache = cache_handle;
    }
    let val = cache[value.toLowerCase()];
    if (val) {
        return val;
    }
    return undefined;
}

module.exports = {
    getAllGroups_Response,
    setAllGroups_Response,
    flush_Group_Cache,
    getUsersByHandleOrEmail,
    isGroupExists
};