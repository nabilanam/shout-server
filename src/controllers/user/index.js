const bcrypt = require('bcrypt')
const config = require('config')

const User = require('../../models/User')
const response = require('./response')

const SALT_ROUNDS = config.get('salt_rounds')

const create = (username, email, password) => {
  return bcrypt
    .hash(password, SALT_ROUNDS)
    .then(hash =>
      new User({
        username,
        email,
        password: hash
      })
        .save()
        .then(user => {
          return response.user_login_token(user.id)
        })
    )
    .catch(err => {
      if (err.message === User.status.DUPLICATE_KEY)
        throw response.duplicate_key_error()
      throw response.internal_server_error()
    })
}

module.exports = {
  create
}
