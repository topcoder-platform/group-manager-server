/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: 'debug',
  PORT: 3000,
  // it is configured to be empty at present, but may add prefix like '/api/v5'
  API_PREFIX: '',
  AUTH_SECRET: 'mysecret',
  VALID_ISSUERS: '["https://api.topcoder-dev.com", "https://api.topcoder.com","https://topcoder-dev.auth0.com/"]',

  // Auth0 config params
  AUTH0_URL: 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_PROXY_SERVER_URL: 'https://auth0proxy.topcoder-dev.com/token',
  AUTH0_AUDIENCE: 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: 86400000,


  DEFAULT_TIMEOUT: 45000,

  MEMBER_API_URL: "https://api.topcoder-dev.com/v3/users",
  MEMBER_SERVICE_TIMEOUT: 60000,

  GROUP_API_URL: "https://api.topcoder-dev.com/v5/groups",

  // health check timeout in milliseconds
  HEALTH_CHECK_TIMEOUT: 3000,

  USER_ROLES: {
    Admin: 'Administrator',
    User: 'Topcoder User'
  },

  MEMBERSHIP_TYPES: {
    Group: 'group',
    User: 'user'
  },

  LOOKER_SERVICE_TIMEOUT: 60000
}
