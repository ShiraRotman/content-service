const mongoose = require('mongoose');

// define the model schema
const MenuSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
	},
	links: [{
		kind: {
			type: String,
			enum: ['category', 'post', 'http'],
		},
		category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
		post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
		value: String,
	}],
});

module.exports = mongoose.model('Menu', MenuSchema);
