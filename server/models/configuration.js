const mongoose = require('mongoose')

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
  // the internal configuration object - can be whatever you want.
  metadata: mongoose.SchemaTypes.Mixed,
  created: {
    type: Date,
    default: Date.now
  }
}, { collection: 'configurations' })

module.exports = mongoose.model('Configuration', Configuration)
