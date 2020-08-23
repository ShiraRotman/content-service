const mongoose = require('mongoose')

// define the model schema
const CommentSchema = new mongoose.Schema({
  tenant: {
    type: String,
    required: true,
    index: true
  },
  author: String,
  content: {
	  type: String,
	  required: true
  },
  created: {
    type: Date,
    default: Date.now,
    required: true,
  }
})

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = {
	Schema: CommentSchema,
	Model: Comment
};
