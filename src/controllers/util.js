const jsonwebtoken = require('jsonwebtoken')
const config = require('config')

const mail = require('../mail')
const DOMAIN = config.get('domain')
const JWT_SECRET = config.get('jwt_secret')

const jwt_token = (user_id, expiresIn) => {
  return jsonwebtoken.sign({ id: user_id }, JWT_SECRET, { expiresIn })
}

const send_authentication_mail = (to, auth_key) =>
  mail.send_mail(
    to,
    'Shout Authentication',
    `Please click the following link to authenticate yourself ${DOMAIN}/auth/${auth_key}`
  )

module.exports = {
  jwt_token,
  send_authentication_mail
}
