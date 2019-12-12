const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./server/routes');

// connect to the database and load models
require('./server/models').connect(config.mongoUri);

const app = express();
app.use(morgan('combined'));
app.use(cors());

// tell the app to parse HTTP body messages
app.use(bodyParser.json());

routes(app);

app.set('port', (process.env.PORT || 9001));
app.set('ip', (process.env.IP || '0.0.0.0'));

// start the server
app.listen(app.get('port'), app.get('ip'), () => {
	console.log(`Content Server is running on port ${app.get('port')}`);
});
