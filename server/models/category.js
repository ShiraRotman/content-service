const shortid = require('shortid')
const mongoose = require('mongoose')
const cacheManager = require('../utils/cache-manager')

const cachePrefix = 'categories:'

// define the model schema
const CategorySchema = new mongoose.Schema({
  name: String,
  path: {
    type: String,
    default: () => shortid.generate(),
    required: true,
  },
  isPublic: Boolean,
  created: {
    type: Date,
    default: Date.now,
  }
}, { collection: 'categories' })

CategorySchema.pre('save', function (next) {
  if (!this.isModified('path')) return next()

  return this.constructor.findOne({ path: this.path })
    .then(item => {
      if (item) {
        next({ message: 'path already exists' })
      }
      next()
    })
    .catch(next)
})

CategorySchema.statics.getCategoryIdByPath = function getCategoryIdByPath (path) {
  return cacheManager.wrap(cachePrefix + 'IdByPath:' + path, () => this.constructor.findOne({ path })
    .select('_id')
    .lean()
    .then(cat => cat ? cat._id : null))
}

module.exports = mongoose.model('Category', CategorySchema)
