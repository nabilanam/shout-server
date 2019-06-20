const Response = require('../response/Response')
const ErrorResponse = require('../response/ErrorResponse')
const ValidatorResponse = require('../response/ValidatorResponse')
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

const duplicate_key_error = field =>
  new ValidatorResponse(http_status.BAD_REQUEST, {
    msg: field + ' already exists',
    param: field.toLowerCase()
  })

const internal_server_error = () =>
  new ErrorResponse(http_status.INTERNAL_SERVER_ERROR, 'Internal server error')

const bad_request = () =>
  new ErrorResponse(http_status.BAD_REQUEST, 'Invalid request')

const not_found = message =>
  message
    ? new ErrorResponse(http_status.NOT_FOUND, message)
    : new ErrorResponse(http_status.NOT_FOUND, 'Not found')

const ok = data => new Response(http_status.OK, data)

const unauthorized = message => {
  return message
    ? new ErrorResponse(http_status.UNAUTHORIZED, message)
    : new ErrorResponse(http_status.UNAUTHORIZED, 'Authorization required')
}

const access_denied = () =>
  new ErrorResponse(http_status.FORBIDDEN, 'Access denied')

module.exports = {
  confirm_email,
  login_token,
  duplicate_key_error,
  internal_server_error,
  unauthorized,
  access_denied,
  bad_request,
  not_found,
  ok
}
