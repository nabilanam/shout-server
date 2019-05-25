const { check, validationResult } = require('express-validator/check')

const ValidatorResponse = require('../../response/ValidatorResponse')

const http_status = require('http-status-codes')
const { username, password } = require('config').get('validation.user')

const create = [
  check('username')
    .not()
    .isEmpty()
    .withMessage('username is required')
    .isLength({
      min: username.min,
      max: username.max
    })
    .withMessage(
      `username must be between ${username.min} to ${username.max} characters`
    ),
  check('email')
    .isEmail()
    .withMessage('valid email is required'),
  check('password')
    .not()
    .isEmpty()
    .withMessage('password is required')
    .isLength({
      min: password.min,
      max: password.max
    })
    .withMessage(
      `password must be ${password.min} to ${password.max} characters long`
    ),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(http_status.BAD_REQUEST)
        .json(new ValidatorResponse(http_status.BAD_REQUEST, errors))
    }
    next()
  }
]

module.exports = {
  create
}
