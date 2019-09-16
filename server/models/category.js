const mongoose = require('mongoose')

// define the model schema
const CategorySchema = new mongoose.Schema({
  name: String,
  path: String,
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

module.exports = mongoose.model('Category', CategorySchema)
