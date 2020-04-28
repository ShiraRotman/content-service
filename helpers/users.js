const callAuthService = require('./call-auth-service')

const cache = {}

function getUsersFromApi (users) {
  return callAuthService('/api/users', {
    params: { users }
  })
}

function removeLater (key) {
  setTimeout(() => delete cache[key], 1000 * 60 * 60)
}

module.exports = {
  async getUsersList (ids) {
    const users = ids.join(',')
    if (cache[users]) {
      return cache[users]
    }
    cache[users] = await getUsersFromApi(users)
    removeLater(users)
    return cache[users]
  }
}
