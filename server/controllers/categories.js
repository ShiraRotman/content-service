const Category = require('mongoose').model('Category');


function getCategoryByPath(req, res, next) {
	return Category.findOne({path: req.params.categoryPath || req.query.category})
		.then(category => {
			if (!category) {
				return Promise.reject(null);
			}
			req.category = category;
			return next();
		})
		.catch(() => res.status(404).jsonp({message: 'category not exists'}).end());
}


function getCategoriesList(req, res) {
	const query = req.query && typeof req.query.isPublic !== 'undefined' ?
		{isPublic: req.query.isPublic === 'true'} : {};

	return Category.find(query)
		.then(list => {
			if (!list) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp(list).end();
		})
		.catch(() => res.status(401).jsonp({message: 'failed to load categories'}).end());
}

function getCategory(req, res) {
	return res.status(200).jsonp(req.category).end();
}

function createCategory(req, res) {
	const body = req.body || {};
	const category = new Category({
		name: body.name,
		path: body.path,
		isPublic: body.isPublic,
	});

	return category.save()
		.then(category => {
			if (!category) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp(category).end();
		})
		.catch(() => res.status(400).jsonp({message: 'category creation failed'}).end());
}

function updateCategory(req, res) {
	const body = req.body || {};
	const category = req.category;

	if (body.name) {
		category.name = body.name;
	}
	if (body.path) {
		category.path = body.path;
	}
	if (typeof body.isPublic !== 'undefined') {
		category.isPublic = body.isPublic;
	}

	return category.save()
		.then(category => {
			return res.status(200).jsonp(category).end();
		})
		.catch(() => res.status(400).jsonp({message: 'category update failed'}).end());
}

function removeCategory(req, res) {
	const category = req.category;

	return category.remove()
		.then(category => {
			return res.status(200).jsonp(category).end();
		})
		.catch(() => res.status(400).jsonp({message: 'category remove failed'}).end());
}

module.exports = {
	getCategoryByPath,
	getCategoriesList,
	getCategory,
	createCategory,
	updateCategory,
	removeCategory,
};
