const express = require('express')
const router = express.Router()
const middleware = require('../../middlewares/auth')
const controller = require('../../controllers/auth')

router.get('/confirm/:auth_key', (req, res) =>
  controller
    .confirm_email(req.params.auth_key)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.post('/login', middleware.login, (req, res) => {
  const { username, password } = req.body

  return controller
    .login(username, password)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

router.get('/extend', middleware.extend, (req, res) =>
  controller
    .extend(req.user_id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/logout', middleware.logout, (req, res) => {
  const { token, seconds } = req
  return controller
    .logout(token, seconds)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

module.exports = router
