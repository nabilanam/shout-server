const mongoose = require('mongoose')
const { Schema } = mongoose
const uuidv4 = require('uuid/v4')

const { created_at, updated_at } = require('../audit')
const errors = require('../errors')

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
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  picture: {
    type: String
  },
  bio: {
    type: String
  },
  quote: {
    type: String
  },
  social: {
    facebook: {
      type: String
    },
    twitter: {
      type: String
    },
    youtube: {
      type: String
    },
    instagram: {
      type: String
    },
    reddit: {
      type: String
    }
  },
  auth_key: {
    type: String
  },
  is_authenticated: {
    type: Boolean,
    default: false
  },
  created_at,
  updated_at
})

schema.pre('save', function(next) {
  this.auth_key = uuidv4()
  this.updated_at = Date.now()
  next()
})

schema.pre('findOneAndUpdate', function(next) {
  this._update.updated_at = Date.now()
  next()
})

schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const r = /index:\s(?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup/i
    const match = error.errmsg.match(r)
    next(new Error(match[1]))
  } else if (error.name === 'ValidationError') {
    next(new Error(errors.FIELD_REQUIRED))
  } else {
    next()
  }
})

schema.post('findOneAndUpdate', function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(errors.DUPLICATE_KEY))
  } else {
    next()
  }
})

const User = mongoose.model('user', schema)
module.exports = User
