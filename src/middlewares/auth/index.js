const jsonwebtoken = require('jsonwebtoken')

const jwt_secret = require('config').get('jwt_secret')
const User = require('../../models/User')
const response = require('../../controllers/response')

const verify = async (req, res, next) => {
  const token = req.header('x-auth-token')

  try {
    const decoded = jsonwebtoken.verify(token, jwt_secret)
    const user = await User.findById(decoded.id)
    req.user = user
    next()
  } catch (err) {
    const unauthorized = response.unauthorized()
    res.status(unauthorized.status).json(unauthorized)
  }
}

module.exports = {
  verify
}
