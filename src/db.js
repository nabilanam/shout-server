const mongoose = require('mongoose')
const config = require('config')

const URI = config.get('DATABASE_URI')

const connect = async () => {
  try {
    await mongoose.connect(URI, { useNewUrlParser: true })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

module.exports = { connect }
