const Menu = require('mongoose').model('Menu');

const categoryPopulation = {
	path: 'links.category',
	select: 'path name _id'
};

function populateMenu(menu) {
	return menu
		.populate(categoryPopulation)
		.populate({
			path: 'links.post',
			select: 'path category _id name',
			populate: {
				path: 'category',
				select: 'path _id'
			}
		});
}

function getMenuByName(req, res, next) {
	return populateMenu(Menu.findOne({name: req.params.menuName}))
		.then(menu => {
			if (!menu) {
				return Promise.reject(null);
			}
			req.menu = menu;
			return next();
		})
		.catch(() => res.status(404).jsonp({message: 'menu not exists'}).end());
}

function getMenusList(req, res) {
	return Menu.distinct('name')
		.then(list => {
			if (!list) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp(list).end();
		})
		.catch(() => res.status(401).jsonp({message: 'failed to load menus list'}).end());
}

function getMenu(req, res) {
	return res.status(200).jsonp(req.menu).end();
}

function createMenu(req, res) {
	const body = req.body || {};
	const menu = new Menu({
		name: body.name,
		links: body.links,
	});

	return menu.save()
		.then(menu => {
			if (!menu) {
				return Promise.reject(null);
			}
			return populateMenu(menu);
		})
		.then((menu) => {
			if (!menu) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp(menu).end();
		})
		.catch(() => res.status(400).jsonp({message: 'menu creation failed'}).end());
}

function updateMenu(req, res) {
	const body = req.body || {};
	const menu = req.menu;

	Object.assign(menu, body);

	return menu.update()
		.then(menu => {
			if (!menu) {
				return Promise.reject(null);
			}
			return populateMenu(menu);
		})
		.then((menu) => {
			if (!menu) {
				return Promise.reject(null);
			}
			return res.status(200).jsonp(menu).end();
		})
		.catch(() => res.status(400).jsonp({message: 'menu update failed'}).end());
}

function removeMenu(req, res) {
	const menu = req.menu;

	return menu.remove()
		.then(menu => {
			return res.status(200).jsonp(menu).end();
		})
		.catch(() => res.status(400).jsonp({message: 'menu remove failed'}).end());
}

module.exports = {
	getMenuByName,
	getMenusList,
	getMenu,
	createMenu,
	updateMenu,
	removeMenu
};