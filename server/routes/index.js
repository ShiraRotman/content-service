function routes(app) {
	require('./categories')(app);
	require('./posts')(app);
	require('./menus')(app);
}

module.exports = routes;
