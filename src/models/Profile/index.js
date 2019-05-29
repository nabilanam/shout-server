const mongoose = require('mongoose')
const { Schema } = mongoose

const { _created_at, _updated_at } = require('../audit')
const User = require('../User')

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    unique: true
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
  _created_at,
  _updated_at
})

schema.pre('save', function(next) {
  if (this.user) next()
  else next(new Error("User doesn't exist"))
})

module.exports = Profile = mongoose.model('profile', schema)
