const _ = require('lodash');
const errors = require('../common/errors');
const cacheService = require('./CacheService');
const utils  = require('../common/utils'); 
const constants = require('../../app-constants');


/**
 * Validate the Group name should confirm to the naming convention.
 * The group name should have a description
 * validation carried out during insert / update of group
 */
function validateGroup(authUser, group) {

    if(!authUser) {
        throw new errors.BadRequestError("Current User is not available");
    }
    if (!group.name) {
        throw new errors.BadRequestError('Group name is required');
    }
    if (!group.description) {
        throw new errors.BadRequestError('Group description is required');
    }
    if (!group.name.startsWith('Wipro - Topgear -')) {
        throw new errors.BadRequestError('Group Name should start with Wipro - Topgear - prefix');
    }
}
/**
 * Check if the Wipro belongs to Wipro. The api validation is required to prevent incorrect
 * The groups must be populated in Cache Service for this is work.
 * members addition via APIs
 */
function validateWiproGroup(wiproGroupId){
    let isGroupExists = cacheService.isGroupExists(wiproGroupId);
    if (!isGroupExists) {
        throw new errors.BadRequestError("Invalid Group. The Group does not belong to Wipro");
    }
}

/**
 * Create group JSON using the request object of Http
 */
function createGroup(requestBody) {

    // Create Group Object
    if (requestBody) {
        let group = {
            name: _.trim(requestBody.name), 
            description: _.trim(requestBody.description),
        };

        if (requestBody.status) {
            groupStatus = constants.GroupStatus.Active;
            if (requestBody.status.toLowerCase() === constants.GroupStatus.InActive.toLowerCase()) {
                groupStatus = constants.GroupStatus.InActive;
            }
            group.status = groupStatus;
        }
        return group;
    }
    return null;
    
}

/**
 * Group api is weird, it needs a full group body, 
 * fix the weirdness here
 */
function mergeGroup(apiGroup, newGroup) {
    apiGroup.name = newGroup.name;
    apiGroup.description = newGroup.description;
    if (newGroup.status) {
      apiGroup.status = newGroup.status;    
    }
    apiGroup = _.omitBy(apiGroup, v => _.isEmpty(v) && _.isString(v));

    let removeAttributes = ['createdBy', 'createdAt', 'id', 'updatedBy', 'updatedAt'];

    _.forEach(removeAttributes, key => {
        delete apiGroup[key];
    })

    if (!apiGroup.status) {
        apiGroup.status = constants.GroupStatus.Active;
    }
   
    return apiGroup;
}

function isParentGroupExists(group) {
    let count = 0;
    if (group.oldParentGroupId) {
        count++;
    }
    if (group.parentGroupId) {
        count++;
    }
    if(count === 0) {
        return false;
    }
    if (count != 2) {
        throw new errors.BadRequestError("Both Old Parent Group Id and Parent Group Id should be provided");
    }
    return true;
}

/**
 * Apppend the coder id field to all group members
 * @param {*} groupMembers 
 */
function appendUserIdField(groupMembers) {
    _.forEach(groupMembers, function(user) {
        user["user.coder_id"] = user.memberId;
    });
}

/**
 * filter out child groups or users
 * @param {groupMembers} 
 * @param {membershipType} is either user or child group
 */
function filterGroupMembersByType(groupMembers, membershipType) {
    let filtered = _.filter(groupMembers, function(member) {
        return (member.membershipType === membershipType);
    });
    return filtered;
}

function validateAllChildGroups(groupMemberArr) {
    _.forEach(groupMemberArr, function(groupMember) {
        let currentChildGroupId = groupMember["user.handle"]
        let isGroupExists = cacheService.isGroupExists(currentChildGroupId);
        if (isGroupExists) {
            groupMember.isValid = false;
            groupMember.message = "The Child Group doesn't belong to Wipro"
        } 
    })
}

//The identifier is provided by the client, hence we cannot remove it
//else the client will not be able identify 
function removeAttributesForInvalidGroupMember(groupMember, inputIdentifier) {
    let attributeArr = ["user.status","user.first_name","user.last_name","user.coder_id"];
    if (inputIdentifier) {
        identifier = inputIdentifier.toLowerCase();
        identifier = (identifier == "email" ? "user.handle" : "user.email");

        attributeArr.push(identifier);
    }

    _.forEach(attributeArr, function(attr){
        delete groupMember[attr];
    })
}

/**
 * Validate all group member sent for addition to the group 
 * a) Handle / email exist
 * b) Email is either topcoder or wipro 
 * @param {*} groupMemberArr 
 */

function validateAllGroupMembers(groupMemberArr) {
    _.forEach(groupMemberArr, function(groupMember) {
        if(!isUserIdPresent(groupMember)) {
            groupMember.isValid = false;
            groupMember.resolved = true;
            groupMember.message = 'User not found. Please check the email and ensure user has registered on platform.';
            return;
        }
        
        if (!isValidGroupMember(groupMember)) {
            groupMember.isValid = false;
            groupMember.message = "The email id of the user should be wipro / appirio / topcoder";
        }
        else {
            groupMember.isValid = true;
        }
    });
}

function generateGroupMember(identifier, values) {
    const groupMemberArr = [];
    const fieldName = identifier == "email" ? "user.email" : "user.handle";

    _.forEach(values, function(value) {
        if (!value) {
            return;
        }
        let groupMember = { message: ""}; //Add a default attribute for message during addition
        groupMember[fieldName] = value;

        groupMemberArr.push(groupMember);
    });
    return groupMemberArr;
}


function isUserIdPresent(groupMember) {
    return (groupMember["user.coder_id"] ? true: false); 
}

function isValidGroupMember(groupMember) {
    const email = groupMember["user.email"];
    if (!email) {
        return false;
    }
    return isValidEmailToAdd(email);
}

function isValidEmailToAdd(emailInput) {
    let email = emailInput;
    
    if(email) {
        email = email.toLowerCase();
    }

    if (email.endsWith("@wipro.com")) {
        return true;
    }
    if (email.endsWith("@topcoder.com")) {
        return true;
    }
    if (email.endsWith("@appirio.com")) {
        return true;
    }
    return false;
}

module.exports = {
    validateGroup,
    createGroup,
    mergeGroup,
    generateGroupMember, 
    filterGroupMembersByType,
    appendUserIdField,
    isValidGroupMember,
    validateWiproGroup,
    validateAllGroupMembers,
    isParentGroupExists,
    removeAttributesForInvalidGroupMember
}