const bcrypt = require('bcrypt')
const config = require('config')

const User = require('../../models/User')
const response = require('../response')
const errors = require('../../models/errors')

const create = (username, email, password) => {
  if (!(username && email && password))
    return Promise.reject(response.bad_request())

  return bcrypt
    .hash(password, config.get('salt_rounds'))
    .then(hash =>
      new User({
        username,
        email,
        password: hash
      })
        .save()
        .then(user => response.confirm_email(email, user.auth_key))
    )
    .catch(err => {
      if (err.message === errors.DUPLICATE_KEY)
        throw response.duplicate_key_error()
      throw response.internal_server_error()
    })
}

const login = (username, password) => {
  if (!(username && password)) return Promise.reject(response.bad_request())

  return User.findOne({ username })
    .then(user =>
      bcrypt.compare(password, user.password).then(res => {
        if (res) return response.login_token(user.id)
        throw new Error()
      })
    )
    .catch(() => {
      throw response.unauthorized('Wrong login credentials')
    })
}

module.exports = {
  create,
  login
}
