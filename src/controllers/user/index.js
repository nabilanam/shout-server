const bcrypt = require('bcrypt')
const config = require('config')

const User = require('../../models/User')
const response = require('./response')

const SALT_ROUNDS = config.get('salt_rounds')

const create = (username, email, password) =>
  bcrypt
    .hash(password, SALT_ROUNDS)
    .then(hash =>
      new User({
        username,
        email,
        password: hash
      })
        .save()
        .then(user => response.login_token(user.id))
    )
    .catch(err => {
      if (err.message === User.status.DUPLICATE_KEY)
        throw response.duplicate_key_error()
      throw response.bad_request()
    })

const login = (username, password) =>
  User.findOne({ username })
    .then(user =>
      bcrypt.compare(password, user.password).then(res => {
        if (res) return response.login_token(user.id)
        throw new Error()
      })
    )
    .catch(() => {
      throw response.login_error()
    })

module.exports = {
  create,
  login
}
