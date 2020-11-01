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
  
  const GroupStatus = {
    Active: 'active',
    InActive: 'inactive'
  }
  
  const EVENT_ORIGINATOR = 'topcoder-groups-shim-api'
  const EVENT_MIME_TYPE = 'application/json'

  const MEMBER_PAGE_SIZE = 10
 
  module.exports = {
    UserRoles,
    GroupStatus,
    MembershipTypes,
    EVENT_ORIGINATOR,
    EVENT_MIME_TYPE,
    MEMBER_PAGE_SIZE,
  }