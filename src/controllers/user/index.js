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

module.exports = {
  create
}
