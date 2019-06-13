const { check, validationResult } = require('express-validator/check')
const ValidatorResponse = require('../../response/ValidatorResponse')
const http_status = require('http-status-codes')

const auth = require('../auth')
const limit = {
  post: {
    min: 1,
    max: 512
  },
  comment: {
    min: 1,
    max: 256
  }
}

const post_body = [
  auth,
  check('text')
    .not()
    .isEmpty()
    .withMessage('post can\'t be empty')
    .isLength({
      min: limit.post.min,
      max: limit.post.max
    })
    .withMessage(
      `post must be between ${limit.post.min} to ${limit.post.max} characters`
    ),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res
        .status(http_status.BAD_REQUEST)
        .json(new ValidatorResponse(http_status.BAD_REQUEST, errors))
    next()
  }
]

const comment_body = [
  auth,
  check('text')
    .not()
    .isEmpty()
    .withMessage('comment can\'t be empty')
    .isLength({
      min: limit.comment.min,
      max: limit.comment.max
    })
    .withMessage(
      `comment must be between ${limit.comment.min} to ${
        limit.comment.max
      } characters`
    ),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res
        .status(http_status.BAD_REQUEST)
        .json(new ValidatorResponse(http_status.BAD_REQUEST, errors))
    next()
  }
]

module.exports = {
  post_body,
  comment_body
}
