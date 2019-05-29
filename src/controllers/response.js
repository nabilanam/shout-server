const Response = require('../response/Response')
const ErrorResponse = require('../response/ErrorResponse')
const util = require('./util')

const http_status = require('http-status-codes')

const confirm_email = (to, auth_key) =>
  util
    .send_authentication_mail(to, auth_key)
    .then(() => new Response(http_status.OK, 'Check email address'))

const login_token = id => {
  const token = util.jwt_token(id, '30d')
  return new Response(http_status.OK, token)
}

const duplicate_key_error = () =>
  new ErrorResponse(http_status.BAD_REQUEST, 'Username or email already exists')

const internal_server_error = () =>
  new ErrorResponse(http_status.INTERNAL_SERVER_ERROR, 'Internal server error')

const bad_request = () =>
  new ErrorResponse(http_status.BAD_REQUEST, 'Invalid request')

const login_error = () =>
  new ErrorResponse(http_status.UNAUTHORIZED, 'Wrong login credentials')

module.exports = {
  confirm_email,
  login_token,
  duplicate_key_error,
  internal_server_error,
  login_error,
  bad_request
}
