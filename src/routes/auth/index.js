const express = require('express')
const router = express.Router()
const middleware = require('../../middlewares/auth')
const controller = require('../../controllers/auth')

router.get('/', (req, res) =>
  controller
    .login_token()
    .catch(response => res.status(response.status).json(response))
)

router.get('/:auth_key', (req, res) =>
  controller
    .login_token(req.params.auth_key)
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

module.exports = router
