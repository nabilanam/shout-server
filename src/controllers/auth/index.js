const bcrypt = require('bcrypt')
const User = require('../../models/User')
const response = require('../response')

const login_token = auth_key =>
  new Promise((resolve, reject) => {
    if (auth_key)
      return User.findOneAndUpdate(
        { auth_key },
        { is_authenticated: true }
      ).then(user =>
        user
          ? resolve(response.login_token(user.id))
          : reject(response.internal_server_error())
      )
    else reject(response.internal_server_error())
  })

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
  login_token,
  login
}
