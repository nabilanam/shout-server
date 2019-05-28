const mongoose = require('mongoose')
const { Schema } = mongoose
const md5 = require('md5')

const { _created_at, _updated_at } = require('../audit')
const status = require('../status')

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  auth_key: {
    type: String
  },
  _created_at,
  _updated_at
})

schema.pre('save', function(next) {
  this.auth_key = md5(this.id)
  next()
})

schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(status.DUPLICATE_KEY))
  } else {
    next()
  }
})

schema.post('findOneAndUpdate', function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(status.DUPLICATE_KEY))
  } else {
    next()
  }
})

User = mongoose.model('user', schema)
User.status = status

module.exports = User
