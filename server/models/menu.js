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
			enum: ['category', 'post'],
		},
		category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
		post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
	}],
});

module.exports = mongoose.model('Menu', MenuSchema);
