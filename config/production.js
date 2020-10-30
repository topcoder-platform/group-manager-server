/**
 * Production configuration file
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  GROUP_API_URL: "https://api.topcoder.com/v5/groups",
  MEMBER_API_URL: "https://api.topcoder.com/v3/users",
  CONNECT_API_URL: "https://api.topcoder.com/v5/projects",
  CHALLENGE_API_URL: "https://api.topcoder.com/v4/challenges"
}
