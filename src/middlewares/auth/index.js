const jsonwebtoken = require('jsonwebtoken')
const http_status = require('http-status-codes')

const jwt_secret = require('config').get('jwt_secret')
const User = require('../../models/User')
const ErrorResponse = require('../../response/ErrorResponse')

const auth = async (req, res, next) => {
  const token = req.header('x-auth-token')

  try {
    const decoded = jsonwebtoken.verify(token, jwt_secret)
    const user = await User.findById(decoded.id)
    req.user = user
    next()
  } catch (err) {
    res
      .status(http_status.FORBIDDEN)
      .json(new ErrorResponse(http_status.FORBIDDEN, 'Access denied'))
  }
}

module.exports = auth
