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
    '/batches': {
      get: {
        controller: 'BatchController',
        method: 'getAllBatches',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
      post: {
        controller: 'BatchController',
        method: 'createBatch',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/connect': {
      get: {
        controller: 'ConnectController',
        method: 'getAllProjects',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/connect/:projectId': {
      get: {
        controller: 'ConnectController',
        method: 'getProject',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
      post: {
        controller: 'ConnectController',
        method: 'submitUpdate',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/payment': {
      get: {
        controller: 'PaymentController',
        method: 'getAllPayments',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/payment/:challengeId': {
      get: {
        controller: 'PaymentController',
        method: 'getChallenge',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      },
      post: {
        controller: 'PaymentController',
        method: 'submitUpdate',
        auth: 'jwt',
        access: [constants.UserRoles.Admin, constants.UserRoles.GroupManager]
      }
    },
    '/health': {
      get: {
        controller: 'HealthController',
        method: 'basicHealth'
      }
    },
    '/basicHealth': {
      get: {
        controller: 'HealthController',
        method: 'basicHealth'
      }
    },
  }