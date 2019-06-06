const { Schema, model } = require('mongoose')
const { created_at, updated_at } = require('../audit')
const errors = require('../errors')

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'post',
    required: true
  },
  created_at,
  updated_at
})

schema.pre('save', function(next) {
  this.updated_at = Date.now()
  next()
})

schema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    next(new Error(errors.FIELD_REQUIRED))
  } else {
    next()
  }
})

const Like = model('like', schema)
module.exports = Like
