const Post = require('mongoose').model('Post');
const Category = require('mongoose').model('Category');

function getCategoryIdByPath(path) {
	return Category
		.findOne({path})
		.select('_id')
		.lean()
		.then(cat => cat ? cat._id : null);
}

function getDisplayPost(post, category) {
	return {
		...post.toObject(),
		category: {
			name: category.name,
			path: category.path
		},
	}
}

function getPostByPath(req, res, next) {
	return Post.findOne({path: req.params.postPath, category: req.category._id})
		.then(post => {
			if (!post) {
				return Promise.reject(null);
			}
			req.post = post;
			return next();
		})
		.catch(() => res.status(404).jsonp({message: 'post not exists'}).end());
}

function getPostsList(req, res) {
	const query = req.query && typeof req.query.isPublic !== 'undefined' ?
		{isPublic: req.query.isPublic === 'true'} : {};

	return Promise.resolve(req.category)
		.then(category => category ? category._id : null)
		.then(categoryId => categoryId || (req.query.category && getCategoryIdByPath(req.query.category)))
		.then(categoryId => {
			if (categoryId) {
				query.category = categoryId;
			}
			return query;
		})
		.then(query =>
			Post.find(query)
				.sort({created: -1})
				.populate('category', 'path')
				.lean()
		)
		.then(list => {
			if (!list) {
				return Promise.reject(null);
			}
			return res.status(200)
				.jsonp(
					list.map(post => {
						post.category = post.category.path;
						return post;
					})
				)
				.end();
		})
		.catch(() => res.status(401).jsonp({message: 'failed to load posts list'}).end());
}

function getPost(req, res) {
	return res.status(200).jsonp(getDisplayPost(req.post, req.category)).end();
}

function createPost(req, res) {
	const body = req.body || {};

	return Promise.resolve(body.category)
		.then(getCategoryIdByPath)
		.then(categoryId => categoryId || Promise.reject('category path does not exist'))
		.then(categoryId => {
			body.category = categoryId;
			return (new Post(body)).save();
		})
		.then(post => {
			if (!post) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp({...post.toObject(), category: body.category}).end();
		})
		.catch((err) => res.status(400).jsonp({message: err || 'post creation failed'}).end());
}

function updatePost(req, res) {
	const body = req.body || {};
	const post = req.post;

	return Promise.resolve(body)
		.then(body => {
			// category replaced
			if (body.category !== req.category.path) {
				return getCategoryIdByPath(body.category).then(id => {
					body.category = id;
					return body;
				})
			}
			delete body.category;
			return body;
		})
		.then(body => Object.assign(post, body))
		.then(post => post.update())
		.then(post => {
			return res.status(200).jsonp(getDisplayPost(post, req.category)).end();
		})
		.catch(() => res.status(400).jsonp({message: 'post update failed'}).end());
}

function removePost(req, res) {
	const post = req.post;

	return post.remove()
		.then(post => {
			return res.status(200).jsonp(getDisplayPost(post, req.category)).end();
		})
		.catch(() => res.status(400).jsonp({message: 'post remove failed'}).end());
}

module.exports = {
	getPostByPath,
	getPostsList,
	getPost,
	createPost,
	updatePost,
	removePost,
};