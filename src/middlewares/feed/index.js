const http_status = require('http-status-codes')
const ObjectId = require('mongoose').Types.ObjectId
const { body, param, validationResult } = require('express-validator/check')
const { verify } = require('../auth')
const ValidatorResponse = require('../../response/ValidatorResponse')

const post_limit = {
  min: 1,
  max: 512
}

const comment_limit = {
  min: 1,
  max: 256
}

const check_validation_result = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res
      .status(http_status.BAD_REQUEST)
      .json(new ValidatorResponse(http_status.BAD_REQUEST, errors))
  next()
}

const post_add = [
  verify,
  body('text')
    .not()
    .isEmpty()
    .withMessage('post can\'t be empty')
    .isLength({
      min: post_limit.min,
      max: post_limit.max
    })
    .withMessage(
      `post must be between ${post_limit.min} to ${post_limit.max} characters`
    ),
  (req, res, next) => check_validation_result(req, res, next)
]

const post_update = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  body('text')
    .not()
    .isEmpty()
    .withMessage('post can\'t be empty')
    .isLength({
      min: post_limit.min,
      max: post_limit.max
    })
    .withMessage(
      `post must be between ${post_limit.min} to ${post_limit.max} characters`
    ),
  (req, res, next) => check_validation_result(req, res, next)
]

const post_get = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  (req, res, next) => check_validation_result(req, res, next)
]

const posts_get = [
  verify,
  param('page')
    .exists()
    .isNumeric()
    .withMessage('invalid page number')
    .custom(page => page > 0)
    .withMessage('invalid page number'),
  (req, res, next) => check_validation_result(req, res, next)
]

const post_remove = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  (req, res, next) => check_validation_result(req, res, next)
]

const like = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  (req, res, next) => check_validation_result(req, res, next)
]

const likes_get = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  param('page')
    .exists()
    .isNumeric()
    .withMessage('invalid page number')
    .custom(page => page > 0)
    .withMessage('invalid page number'),
  (req, res, next) => check_validation_result(req, res, next)
]

const comment_add = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  body('text')
    .not()
    .isEmpty()
    .withMessage('comment can\'t be empty')
    .isLength({
      min: comment_limit.min,
      max: comment_limit.max
    })
    .withMessage(
      `comment must be between ${comment_limit.min} to ${
        comment_limit.max
      } characters`
    ),
  (req, res, next) => check_validation_result(req, res, next)
]

const comment_update = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  param('comment_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid comment_id'),
  body('text')
    .not()
    .isEmpty()
    .withMessage('comment can\'t be empty')
    .isLength({
      min: comment_limit.min,
      max: comment_limit.max
    })
    .withMessage(
      `comment must be between ${comment_limit.min} to ${
        comment_limit.max
      } characters`
    ),
  (req, res, next) => check_validation_result(req, res, next)
]

const comment_remove = [
  verify,
  param('post_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid post_id'),
  param('comment_id')
    .exists()
    .custom(id => ObjectId.isValid(id))
    .withMessage('invalid comment_id'),
  (req, res, next) => check_validation_result(req, res, next)
]

module.exports = {
  post_add,
  post_update,
  post_get,
  posts_get,
  post_remove,
  like,
  likes_get,
  comment_add,
  comment_update,
  comments_get: likes_get,
  comment_remove
}
