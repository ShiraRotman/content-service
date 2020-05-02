const callAuthService = require('./call-auth-service')
const cacheManager = require('./cache-manager')
const cachePrefix = 'usersDisplays:'

function getUsersFromApi (users) {
  return callAuthService('/api/users', {
    params: { users }
  })
}

module.exports = {
  getUsersList (ids) {
    const users = ids.join(',')
    return cacheManager.wrap(cachePrefix + users, () => getUsersFromApi(users))
  }
}
