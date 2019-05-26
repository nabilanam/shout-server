const { MongoMemoryServer } = require('mongodb-memory-server')

const db = require('../index')

let server = null

const start = () => {
  server = new MongoMemoryServer()
  return server
    .getConnectionString()
    .then(uri => db.connect_uri(uri))
    .catch(err => console.error(err.message))
}

const stop = () => {
  db.disconnect()
  return server.stop()
}

module.exports = {
  start,
  stop
}
