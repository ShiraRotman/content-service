console.log('RUN MIGRATOR')
require('child_process').execSync('node ./migrator',
  { stdio: 'inherit', cwd: __dirname, env: process.env })
console.log('RUN CONTENT')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const { port, mongoUri } = require('./config')

// connect to the database and load models
require('./server/models').connect(mongoUri)

const app = express()
app.use(morgan('combined'))
app.use(cors())

// tell the app to parse HTTP body messages
app.use(bodyParser.json())

require('./server/routes')(app)

app.set('port', port)
app.set('ip', (process.env.IP || '127.0.0.1'))

// start the server
app.listen(app.get('port'), app.get('ip'), () => {
  console.log(`Content Server is running on port ${app.get('port')}`)
})
