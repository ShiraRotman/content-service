const { mongoUri } = require('../config')
const { MIGRATION_KEY } = require('./consts')

const mongoose = require('mongoose')
const connection = require('../server/models').connect(mongoUri)

const Configuration = mongoose.model('Configuration')

const currentInstance = Date.now() + Math.random()

connection
  .then(start)
  .then(() => process.exit(0))
  .catch((err) => {
    console.log('migration error!')
    console.error(err)
    process.exit(1)
  })

async function start () {
  const { getCurrentMigrationHandler, clearCurrentMigrationHandler } = require('./migration-handler')
  const { initMigrationConfig, getVersionConfig } = require('./migration-config')
  const { runMigrationsForward } = require('./runner')

  const { migrationVersion } = require('../package.json');

  const config = await getVersionConfig()
  // new app - create initial configs
  if (!config) {
    return initMigrationConfig(migrationVersion)
  }
  // same version, nothing to do here.
  if (migrationVersion === config.metadata.latestContentMigration) {
    return
  }

  const { metadata } = await getCurrentMigrationHandler()
  // another pod / instance / replica is handling the migration
  if (metadata.isMigrationRunning) {
    return
  }

  // update metadata to possess the migration process
  await Configuration.updateOne({ key: MIGRATION_KEY, 'metadata.isMigrationRunning': false }, {
    $set: {
      metadata: {
        isMigrationRunning: true,
        handler: currentInstance
      }
    }
  })

  // check if this current instance is possessing the migration process, if not - close process.
  const { metadata: { isMigrationRunning, handler } } = await getCurrentMigrationHandler()
  if (!(isMigrationRunning && handler === currentInstance)) {
    return
  }

  if (migrationVersion > config.metadata.latestContentMigration) {
    return runMigrationsForward(config.metadata.latestContentMigration)
      .then(clearCurrentMigrationHandler, clearCurrentMigrationHandler)
  }
}
