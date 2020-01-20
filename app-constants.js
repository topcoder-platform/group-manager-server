/**
 * App constants
 */
const UserRoles = {
    Admin: 'administrator',
    User: 'Topcoder User',
    GroupManager: 'Group Manager'
  }
  
  const MembershipTypes = {
    Group: 'group',
    User: 'user'
  }
  
  const EVENT_ORIGINATOR = 'topcoder-groups-shim-api'
  const EVENT_MIME_TYPE = 'application/json'

  const MEMBER_PAGE_SIZE = 20
 
  module.exports = {
    UserRoles,
    MembershipTypes,
    EVENT_ORIGINATOR,
    EVENT_MIME_TYPE,
    MEMBER_PAGE_SIZE,
  }