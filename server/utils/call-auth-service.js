const { callInternalService, SERVICES: { auth } } = require('./internal-service')

function callAuthService (url, options) {
  return callInternalService(auth, {
    ...options,
    url,
  })
    .then(axiosRes => axiosRes.data)
}

module.exports = callAuthService
