const app = require('@greenpress/api-kit').app()

require('./configurations')(app);
require('./categories')(app);
require('./posts')(app);
require('./comments')(app);
require('./menus')(app);
require('./tags')(app);
