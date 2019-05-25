const mongoose = require('mongoose')
const config = require('config')

const URI = config.get('database_uri')

const connect = async () => {
  try {
    await mongoose.connect(URI, { useNewUrlParser: true, useCreateIndex: true })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

module.exports = { connect }
