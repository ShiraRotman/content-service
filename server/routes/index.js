function routes(app) {
	const authCheck = require('../middleware/auth-check');
	const editorCheck = require('../middleware/editor-check');

	const {
		getCategoriesList, createCategory, getCategoryByPath, getCategory,
		updateCategory,
		removeCategory
	} = require('./categories');

	const {
		getPostsList, createPost, getPostByPath, getPost,
		updatePost,
		removePost
	} = require('./posts');


	const {
		getMenuByName,
		getMenusList,
		createMenu,
		getMenu,
		updateMenu,
		removeMenu,
	} = require('./menus');


	// categories routes
	app
		.get('/api/categories', getCategoriesList)
		.post('/api/categories', authCheck, editorCheck, createCategory)
		.get('/api/categories/:categoryPath', getCategoryByPath, getCategory)
		.put('/api/categories/:categoryPath', authCheck, editorCheck, getCategoryByPath, updateCategory)
		.delete('/api/categories/:categoryPath', authCheck, editorCheck, getCategoryByPath, removeCategory);

	// posts routes - from category and from posts directly
	app
		.get('/api/categories/:categoryPath/posts', getCategoryByPath, getPostsList)
		.post('/api/categories/:categoryPath/posts', authCheck, editorCheck, getCategoryByPath, createPost)
		.get('/api/categories/:categoryPath/posts/:postPath', getCategoryByPath, getPostByPath, getPost)
		.put('/api/categories/:categoryPath/posts/:postPath', authCheck, editorCheck, getCategoryByPath, getPostByPath, updatePost)
		.delete('/api/categories/:categoryPath/posts/postPath', authCheck, editorCheck, getCategoryByPath, getPostByPath, removePost);
	app
		.get('/api/posts', getPostsList)
		.post('/api/posts', authCheck, editorCheck, createPost)
		.get('/api/posts/:categoryPath/:postPath', getCategoryByPath, getPostByPath, getPost)
		.put('/api/posts/:categoryPath/:postPath', authCheck, editorCheck, getCategoryByPath, getPostByPath, updatePost)
		.delete('/api/categories/:categoryPath/postPath', authCheck, editorCheck, getCategoryByPath, getPostByPath, removePost);

	// menus routes
	app
		.get('/api/menus', getMenusList)
		.post('/api/menus', authCheck, editorCheck, createMenu)
		.get('/api/menus/:menuName', getMenuByName, getMenu)
		.put('/api/menus/:menuName', authCheck, editorCheck, getMenuByName, updateMenu)
		.delete('/api/menus/:menuName', authCheck, editorCheck, getMenuByName, removeMenu);
}

module.exports = routes;

