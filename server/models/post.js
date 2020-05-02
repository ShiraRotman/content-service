const shortid = require('shortid')
const mongoose = require('mongoose')

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

PostSchema.statics.search = function search (query, select, { limit, offset, categoriesPopulate }) {
  return this.find(query)
    .select(select)
    .sort({ created: -1 })
    .populate('category', categoriesPopulate || 'path')
    .limit(limit)
    .skip(offset)
    .lean()
}

module.exports = mongoose.model('Post', PostSchema)
