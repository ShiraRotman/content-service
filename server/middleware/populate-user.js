const { editorsRoles, adminRole } = require('../../config')
const callAuthService = require('../../helpers/call-auth-service')

/**
 *  Populate user on request
 */
module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    return next()
  }

  return callAuthService('/api/me', {
    headers: {
      authorization: req.headers.authorization,
    }
  }).then(user => {
    req.user = user
    req.user.isEditor = req.user.roles.some(role => editorsRoles.includes(role))
    req.user.isAdmin = req.user.roles.includes(adminRole)
    return next()
  }).catch(() => {
    return next()
  })
}
