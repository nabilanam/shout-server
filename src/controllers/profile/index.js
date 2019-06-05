const User = require('../../models/User')
const response = require('../response')

const get = username => {
  if (!username) return Promise.reject(response.internal_server_error())

  return User.findOne({ username })
    .select(
      '-_id -__v -auth_key -password -created_at -updated_at -is_authenticated'
    )
    .then(user => {
      if (!user) throw new Error()
      return response.ok_data(user)
    })
    .catch(() => {
      throw response.user_not_found()
    })
}

const update = (user, username, password, email, bio, quote, social) => {
  if (!user) return Promise.reject(response.internal_server_error())

  if (username) user.username = username
  if (password) user.password = password
  if (email) user.email = email
  if (bio) user.bio = bio
  if (quote) user.quote = quote
  if (social) user.social = social

  return user
    .save()
    .then(u => {
      u._doc._id = undefined
      u._doc.__v = undefined
      u._doc.auth_key = undefined
      u._doc.password = undefined
      u._doc.created_at = undefined
      u._doc.updated_at = undefined
      u._doc.is_authenticated = undefined
      return response.ok_data(u)
    })
    .catch(() => {
      throw response.internal_server_error()
    })
}

module.exports = {
  get,
  update
}
