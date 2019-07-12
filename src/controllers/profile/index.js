const fs = require('fs')
const path = require('path')
const config = require('config')
const User = require('../../models/User')
const response = require('../response')

const selector =
  '-__v -auth_key -password -created_at -updated_at -is_authenticated'

const getByUsername = (username, selfUserId) => {
  if (!username) return Promise.reject(response.internal_server_error())

  return User.findOne({ username })
    .select(selector)
    .then(user => {
      if (!user) throw new Error()
      if (user.id !== selfUserId) user._doc.email = undefined
      return response.ok(user)
    })
    .catch(() => {
      throw response.not_found('User not found')
    })
}

const getByUserId = (userId, selfUserId) => {
  if (!userId) return Promise.reject(response.internal_server_error())

  return User.findById(userId)
    .select(selector)
    .then(user => {
      if (!user) throw new Error()
      if (user.id !== selfUserId) user._doc.email = undefined
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

const update = (
  user,
  username,
  firstname,
  lastname,
  password,
  email,
  bio,
  quote,
  social
) => {
  if (!user) return Promise.reject(response.internal_server_error())

  if (username) user.username = username
  if (firstname) user.firstname = firstname
  if (lastname) user.lastname = lastname
  if (password) user.password = password
  if (email && email !== user.email) {
    user.email = email
    user.is_authenticated = false
  }
  if (bio) user.bio = bio
  if (quote) user.quote = quote
  if (social) user.social = JSON.parse(social)

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
  get: getByUsername,
  getByUserId,
  get_picture,
  update
}
