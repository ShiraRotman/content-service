const { editorsRoles, adminRole } = require('../../config')
const cacheManager = require('../utils/cache-manager')
const callAuthService = require('../utils/call-auth-service')

const cachePrefix = 'userByToken:'

function getUser (authorization) {
  return callAuthService('/api/me', { headers: { authorization } }).then(user => {
    user.isEditor = user.roles.some(role => editorsRoles.includes(role))
    user.isAdmin = user.roles.includes(adminRole)
    return user
  })
}

/**
 *  Populate user on request
 */
module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next()
    return
  }
  const authorization = req.headers.authorization

  cacheManager.wrap(cachePrefix + authorization, () => getUser(authorization))
    .then(user => {
      req.user = user
      next()
    }).catch(() => {
    next()
  })
}
