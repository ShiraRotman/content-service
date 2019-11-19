const shortid = require('shortid')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// define the model schema
const PostSchema = new mongoose.Schema({
  path: {
    type: String,
    default: () => shortid.generate(),
    required: true,
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  isPublic: Boolean,
  authors: [String],
  title: {
    type: String,
    required: true,
  },
  short: String,
  thumbnail: String,
  content: String,
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
    required: true,
  }
})

PostSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Post', PostSchema)
