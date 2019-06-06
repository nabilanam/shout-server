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

const not_found = message => new ErrorResponse(http_status.NOT_FOUND, message)

const ok = data => new Response(http_status.OK, data)

const unauthorized = message => {
  return message
    ? new ErrorResponse(http_status.UNAUTHORIZED, message)
    : new ErrorResponse(http_status.UNAUTHORIZED, 'Authorization required')
}

module.exports = {
  confirm_email,
  login_token,
  duplicate_key_error,
  internal_server_error,
  unauthorized,
  bad_request,
  not_found,
  ok
}
