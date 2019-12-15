const editorsRoles = process.env.EDITORS_ROLES ? process.env.EDITORS_ROLES.split(',') : ['editor', 'admin']

module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost/auth-service',
  authService: {
    protocol: process.env.AUTH_SERVICE_PROTOCOL || 'http',
    url: process.env.AUTH_SERVICE_URL || 'localhost',
    port: process.env.AUTH_SERVICE_PORT || 9000,
  },
  editorsRoles,
  appConfiguration: process.env.APP_CONFIGURATION || 'app-configuration'
}
