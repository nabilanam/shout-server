const fs = require('fs')
const path = require('path')
const config = require('config')
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
      return response.ok(user)
    })
    .catch(() => {
      throw response.not_found('User not found')
    })
}

const get_picture = user_id => {
  if (!user_id) return Promise.reject(response.internal_server_error())

  const file_path = path.resolve(
    path.join(config.get('image_directory'), user_id)
  )

  if (fs.existsSync(file_path)) {
    return Promise.resolve(response.ok(file_path))
  }

  return Promise.resolve(response.ok(path.resolve(config.get('image_default'))))
}

const update = (user, username, password, email, bio, quote, social) => {
  if (!user) return Promise.reject(response.internal_server_error())

  if (username) user.username = username
  if (password) user.password = password
  if (email && email !== user.email) {
    user.email = email
    user.is_authenticated = false
  }
  if (bio) user.bio = bio
  if (quote) user.quote = quote
  if (social) user.social = social

  return user
    .save()
    .then(u => {
      if (!u.is_authenticated) {
        return response.confirm_email(email, u._doc.auth_key)
      } else {
        u._doc.__v = undefined
        u._doc.auth_key = undefined
        u._doc.password = undefined
        u._doc.created_at = undefined
        u._doc.updated_at = undefined
        u._doc.is_authenticated = undefined
        return response.ok(u)
      }
    })
    .catch(() => {
      throw response.internal_server_error()
    })
}

module.exports = {
  get,
  get_picture,
  update
}
