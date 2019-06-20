const { MongoMemoryServer } = require('mongodb-memory-server')

const db = require('../index')

let server = null
const options = {
  binary: {
    version: '4.0.9'
  },
  instance: {
    storageEngine: 'wiredTiger'
  }
}

const start = () => {
  server = new MongoMemoryServer(options)
  return (
    server
      .getConnectionString()
      .then(uri => db.connect_uri(uri))
      // eslint-disable-next-line no-console
      .catch(console.error)
  )
}

const stop = () => {
  db.disconnect()
  return server.stop()
}

module.exports = {
  start,
  stop
}
