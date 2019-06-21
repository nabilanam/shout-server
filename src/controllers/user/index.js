const bcrypt = require('bcrypt')
const config = require('config')

const User = require('../../models/User')
const response = require('../response')

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
      if (err.message === 'username')
        throw response.duplicate_key_error('Username')
      else if (err.message === 'email')
        throw response.duplicate_key_error('Email')
      throw response.internal_server_error()
    })
}

const login = (username, password) => {
  if (!(username && password)) return Promise.reject(response.bad_request())

  return User.findOne({ username })
    .then(user =>
      bcrypt.compare(password, user.password).then(res => {
        if (!res) throw new Error()
        if (!user.is_authenticated) throw new Error('auth')
        return response.login_token(user.id)
      })
    )
    .catch(error => {
      if (error.message === 'auth')
        throw response.unauthorized('Email address is not confirmed')
      throw response.unauthorized('Wrong login credentials')
    })
}

module.exports = {
  create,
  login
}
