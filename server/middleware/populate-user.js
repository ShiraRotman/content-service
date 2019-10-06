const { editorsRoles } = require('../../config')
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
    if (req.user.roles.find(role => editorsRoles.includes(role))) {
      req.user.isEditor = true
    }
    return next()
  }).catch(() => {
    return next()
  })
}
