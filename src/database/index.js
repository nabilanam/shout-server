const mongoose = require('mongoose')
const config = require('config')

const URI = config.get('database_uri')

const connect_uri = uri =>
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .catch(() => {
      process.exit(1)
    })

const connect = () => connect_uri(URI)

const disconnect = () => mongoose.disconnect()

module.exports = { connect, connect_uri, disconnect }
