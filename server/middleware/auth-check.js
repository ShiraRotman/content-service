const callAuthService = require('../../helpers/call-auth-service')

/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end()
  }

  return callAuthService('/api/me', {
    headers: {
      authorization: req.headers.authorization,
    }
  })
    .then(user => {
      req.user = user
      return next()
    })
    .catch(() => {
      return res.status(401).end()
    })
}
