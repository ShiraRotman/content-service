const mongoose = require('mongoose')
const cacheManager = require('../utils/cache-manager')

const cachePrefix = 'configuration:'

// define the model schema
const Configuration = new mongoose.Schema({
  // configuration name
  key: {
    type: String,
    required: true,
    unique: true,
  },
  // is public to see - like site configuration, or not public, like services versions..
  public: {
    type: Boolean,
    default: () => true,
  },
  description: String,
  // the internal configuration object - can be whatever you want.
  metadata: mongoose.SchemaTypes.Mixed,
  created: {
    type: Date,
    default: Date.now
  }
}, { collection: 'configurations' })

Configuration.statics.getByKey = function getByKey (key, isAdmin) {
  if (isAdmin) {
    return this.constructor.findOne({ key }).then(config => {
      if (config.public) {
        cacheManager.set(cachePrefix + key, JSON.stringify({ key, metadata: config.metadata }))
      }
      return config
    })
  }
  return cacheManager.wrap(cachePrefix + key, () => {
    return this.constructor.findOne({ key, public: true })
      .select('key metadata')
      .lean()
      .then(config => JSON.stringify({ key, metadata: config.metadata }))
  })
}

module.exports = mongoose.model('Configuration', Configuration)
