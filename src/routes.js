const constants = require('../app-constants');

module.exports = {
    '/groups': {
      get: {
        controller: 'GroupShimController',
        method: 'getAllGroups',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
      post: {
        controller: 'GroupShimController',
        method: 'createGroup',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/groups/:groupId': {
      put: {
        controller: 'GroupShimController',
        method: 'updateGroup',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
      /*post: {
        controller: 'GroupShimController',
        method: 'createGroup',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }*/
    },
    '/groups/:groupId/members': {
      get: {
        controller: 'GroupShimController',
        method: 'getGroupMembers',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
    },
    '/groups/:groupId/members/:identifier': {
      post: {
        controller: 'GroupShimController',
        method: 'addGroupMember',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/groups/:groupId/members/:memberId': {
      delete: {
        controller: 'GroupShimController',
        method: 'deleteGroupMember',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/health': {
      get: {
        controller: 'HealthController',
        method: 'checkHealth'
      }
    },
    '/basicHealth': {
      get: {
        controller: 'HealthController',
        method: 'basicHealth'
      }
    },
  }