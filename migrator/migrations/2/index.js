const mongoose = require('mongoose')
const { appConfiguration } = require('../../../config')

const Configuration = mongoose.model('Configuration')

/**
 * create site configuration
 */

/**
 * check potential changes to migrate
 */
async function check () {
  const hasConfig = await Configuration.countDocuments({ key: appConfiguration })
  return !hasConfig
}

/**
 * migrate relevant db rows to fit the new upgrade
 */
function migrate () {
  const row = new Configuration({
    key: appConfiguration,
    public: true,
    metadata: {
      name: 'greenpress',
      language: 'en',
      direction: 'ltr',
      description: 'amazing blog platform',
      theme: 'damal',
    }
  })
  return row.save()
}

/**
 * check if all migration changes done as expected
 */
function verify () {
  return Configuration.countDocuments({ key: appConfiguration }).then(count => {
    if (!count) return Promise.reject()
  })
}

module.exports = {
  check, migrate, verify
}
