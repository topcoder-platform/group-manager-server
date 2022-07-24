/**
 * This file defines helper methods
 */

const _ = require('lodash');
const config = require('config');

const constants = require('../../app-constants');


/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Check if exists.
 *
 * @param {Array} source the array in which to search for the term
 * @param {Array | String} term the term to search
 */
function checkIfExists (source, term) {
  let terms

  if (!_.isArray(source)) {
    throw new Error('Source argument should be an array')
  }

  source = source.map(s => s.toLowerCase())

  if (_.isString(term)) {
    terms = term.split(' ')
  } else if (_.isArray(term)) {
    terms = term.map(t => t.toLowerCase())
  } else {
    throw new Error('Term argument should be either a string or an array')
  }

  for (let i = 0; i < terms.length; i++) {
    if (source.includes(terms[i])) {
      return true
    }
  }
  return false
}

/**
 * Check if the user has admin or Topgear Admin role
 * required for calling this service
 * @param {Object} authUser the user
 * TODO: Improve performance of the function
 
function hasGroupAdminRole(authUser) {
    for (let i = 0; i < authUser.roles.length; i++) {
        const currentRole = authUser.roles[i].toLowerCase();
        if (currentRole === config.USER_ROLES.TopgearAdmin.toLowerCase()) {
            return true;
        }
        if (currentRole == config.USER_ROLES.Admin.toLowerCase()) {
            return true;
        }
    }
    return false;
} */

function createGroupMembershipUser(userId) {
   return  {
     "memberId": userId.toString(),
     "membershipType": constants.MembershipTypes.User
   };
}

function createGroupMembershipGroup(groupId) {
  return {
    "memberId": groupId,
    "membershipType": constants.MembershipTypes.Group
  };
}

/**
 * The top group is Wipro All and it has sub Groups. The function brings all groups at the 
 * same level and save the Child Group Ids only. This will help in client side display 
 * and redux
 */
function flattenGroupResult(allGroups) {
   let masterList = [];
   extractChildGroups(masterList, allGroups);
   masterList.pop(); //Remove the Wipro All Parent Id, we dont need to show it

   removeNotUsedAttributes(masterList);
   return masterList;
}

/**
 * If Inactive groups are required for review
 * @param  masterList 
 */
function removeInactiveGroups(masterList) {
  //If status is set to Inactive then remove the group from the list
  _.remove(masterList, 
      group => isGroupInactive(group));
}

function isGroupInactive(group) {
  let groupStatus = _.get(group, "status", constants.GroupStatus.Active);
  return groupStatus === constants.GroupStatus.InActive;
}

/**
 * We are not using couple of attributes on UI
 * Lets get rid of them to lighten the load
 */
function removeNotUsedAttributes(masterList) {
   var unusedAttributes = ["updatedBy","createdBy","ssoId","privateGroup",
                           "domain","selfRegister"];

   _.forEach(masterList, function(group) {
      _.forEach(unusedAttributes, function(attribute){
         delete group[attribute];
      });
   })
   
}

function extractChildGroups(masterList, parentGroup) {
   let childGroupIds = [];

    _.forEach(parentGroup.subGroups, function(childGroup) {
      extractChildGroups(masterList, childGroup); 
      childGroupIds.push(childGroup.id) 
   });
   delete parentGroup.subGroups;

   parentGroup.childGroupIds = childGroupIds;
   masterList.push(parentGroup);
}
/**
 * 
 * @param {*} String of user Id, can be a single string or a comma separated
 */
function extractDefaultUsers(userList) {
  if (!userList) {
    return [];
  }
  return _.map(_.compact((userList).split(',')), _.trim)
}

/**
 * 
 * @returns the date as timestamp, convert the colons to hypens to make the str URL friendly for S3
 */

function getCurrentTimestamp() {
  const dt = new Date();
  const dtString = dt.toISOString();

  const regex = /(\.|\:)/ig;
  return dtString.replace(regex, "-");
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  checkIfExists,
  createGroupMembershipUser,
  createGroupMembershipGroup,
  flattenGroupResult,
  extractDefaultUsers,
  getCurrentTimestamp
}