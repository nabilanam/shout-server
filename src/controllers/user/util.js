const mail = require('../../mail')
const DOMAIN = require('config').get('domain')

const send_authentication_mail = (to, auth_key) =>
  mail.send_mail(
    to,
    'Shout Authentication',
    `Please click the following link to authenticate yourself ${DOMAIN}/auth/${auth_key}`
  )

module.exports = {
  send_authentication_mail
}
