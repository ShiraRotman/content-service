const { callInternalService, SERVICES } = require('./internal-service')

function callAuthService (url, options) {
  return callInternalService(SERVICES.auth, {
    ...options,
    url,
  })
    .then(axiosRes => axiosRes.data)
}

module.exports = callAuthService
