const jsonwebtoken = require('jsonwebtoken')
const Response = require('../../response/Response')
const ErrorResponse = require('../../response/ErrorResponse')

const http_status = require('http-status-codes')
const JWT_SECRET = require('config').get('jwt_secret')

const user_login_token = id => {
  const token = jsonwebtoken.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
  return new Response(http_status.OK, token)
}

const duplicate_key_error = () => {
  return new ErrorResponse(
    http_status.BAD_REQUEST,
    'Username or email already exists'
  )
}

const internal_server_error = () => {
  return new ErrorResponse(
    http_status.INTERNAL_SERVER_ERROR,
    'Internal server error'
  )
}

module.exports = {
  user_login_token,
  duplicate_key_error,
  internal_server_error
}
