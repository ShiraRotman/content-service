const shortid = require('shortid')
const mongoose = require('mongoose')
const cacheManager = require('../utils/cache-manager')

const cachePrefix = 'posts:'

// define the model schema
const PostSchema = new mongoose.Schema({
  path: {
    type: String,
    default: () => shortid.generate(),
    required: true,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isPublic: Boolean,
  authors: [String],
  title: {
    type: String,
    required: true,
  },
  short: String,
  thumbnail: String,
  contents: [String],
  editorContentsStates: [{
    type: String,
    enum: ['html', 'editor', 'view']
  }],
  tags: [{
    type: String,
    index: true,
  }],
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  }
})

PostSchema.pre('save', function (next) {
  this.updated = new Date()
  if (!this.isModified('path')) return next()

  return this.constructor.findOne({ path: this.path, category: this.category })
    .then(item => {
      if (item) {
        next({ message: 'path already exists at category' })
      }
      next()
    })
    .catch(next)
})

PostSchema.statics.search = function search (query, select, { limit, offset, categoriesFields }, useCache = false) {

  const makeSearch = () => this.find(query)
    .select(select)
    .sort({ created: -1 })
    .populate('category', categoriesFields || 'path')
    .limit(limit)
    .skip(offset)
    .lean()
    .then(list => {
      if (list && list.length) {
        if (!categoriesFields) {
          list = list.map(post => {
            post.category = post.category.path
            return post
          })
        }
        return JSON.stringify(list)
      }
      return '[]'
    })

  if (useCache) {
    return cacheManager.wrap(`${cachePrefix}search:${query}.${select}.${limit}.${offset}.${categoriesFields}`, makeSearch)
  } else {
    return makeSearch()
  }
}

module.exports = mongoose.model('Post', PostSchema)
