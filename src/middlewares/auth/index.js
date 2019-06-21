const jsonwebtoken = require('jsonwebtoken')
const http_status = require('http-status-codes')
const client = require('../../database/redis')
const { check, validationResult } = require('express-validator/check')
const { username, password } = require('config').get('validation.user')
const jwt_secret = require('config').get('jwt_secret')
const User = require('../../models/User')
const response = require('../../controllers/response')
const ValidatorResponse = require('../../response/ValidatorResponse')

const verify = async (req, res, next) => {
  const token = req.header('x-auth-token')
  const unauthorized = response.unauthorized()

  client.get(token, async (error, value) => {
    if (!error && value === 'true') {
      return res.status(unauthorized.status).json(unauthorized)
    }

    try {
      const decoded = jsonwebtoken.verify(token, jwt_secret)
      const user = await User.findById(decoded.id)

      if (!user.is_authenticated)
        return res.status(unauthorized.status).json(unauthorized)

      req.user = user
      next()
    } catch (err) {
      res.status(unauthorized.status).json(unauthorized)
    }
  })
}

const login = [
  check('username')
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .isLength({
      min: username.min,
      max: username.max
    })
    .withMessage(
      `Username must be between ${username.min} to ${username.max} characters`
    ),

  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({
      min: password.min,
      max: password.max
    })
    .withMessage(
      `Password must be ${password.min} to ${password.max} characters long`
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

const logout = async (req, res, next) => {
  const token = req.header('x-auth-token')

  try {
    const decoded = jsonwebtoken.verify(token, jwt_secret)
    req.token = token
    req.seconds = decoded.exp - decoded.iat
    next()
  } catch (err) {
    const unauthorized = response.unauthorized()
    res.status(unauthorized.status).json(unauthorized)
  }
}

module.exports = {
  verify,
  login,
  logout
}
