const { redisUrl } = require('../../config')

const cacheManager = require('cache-manager').caching({
  store: redisUrl ? require('cache-manager-redis') : 'memory',
  ttl: 600,
})

module.exports = cacheManager
