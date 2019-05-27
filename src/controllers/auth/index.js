const User = require('../../models/User')
const response = require('../response')

const login_token = auth_key =>
  new Promise((resolve, reject) => {
    if (auth_key)
      return User.findOneAndUpdate({ auth_key }, { auth_key: '' }).then(user =>
        user
          ? resolve(response.login_token(user.id))
          : reject(response.internal_server_error())
      )
    else reject(response.internal_server_error())
  })

module.exports = {
  login_token
}
