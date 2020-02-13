const Configuration = require('mongoose').model('Configuration')

function getConfigurationByKey (req, res, next) {
  const query = { key: req.params.configKey }
  let select = 'key metadata'
  if (req.user.isAdmin) {
    select += ' public public description created'
  } else {
    query.public = true
  }
  return Configuration.findOne(query)
    .select(select)
    .then(configuration => {
      if (!configuration) {
        return Promise.reject(null)
      }
      req.configuration = configuration
      return next()
    })
    .catch(() => res.status(404).jsonp({ message: 'configuration not exists' }).end())
}

function getConfigurationsList (req, res) {
  return Configuration.find({})
    .select('key public description created')
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      return res.status(200).jsonp(list).end()
    })
    .catch(() => res.status(401).jsonp({ message: 'failed to load configurations list' }).end())
}

function getConfiguration (req, res) {
  return res.status(200).jsonp(req.configuration).end()
}

function updateConfiguration (req, res) {
  const body = req.body || {}
  const configuration = req.configuration

  if (body.description) {
    configuration.description = body.description
  }
  if (body.metadata) {
    configuration.metadata = body.metadata
  }

  return configuration.save()
    .then((configuration) => {
      if (!configuration) {
        return Promise.reject(null)
      }
      return res.status(200).jsonp(configuration).end()
    })
    .catch(() => res.status(400).jsonp({ message: 'configuration update failed' }).end())
}

module.exports = {
  getConfigurationsList,
  getConfigurationByKey,
  getConfiguration,
  updateConfiguration
}
