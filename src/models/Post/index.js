const { Schema, model } = require('mongoose')
const { created_at, updated_at } = require('../audit')
const errors = require('../errors')

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'like' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  created_at,
  updated_at
})

schema.pre('save', function(next) {
  this.updated_at = Date.now()
  next()
})

schema.pre('findOneAndUpdate', function(next) {
  this._update.updated_at = Date.now()
  next()
})

schema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    next(new Error(errors.FIELD_REQUIRED))
  } else {
    next()
  }
})

const Post = model('post', schema)
module.exports = Post
