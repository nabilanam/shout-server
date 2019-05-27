const express = require('express')
const router = express.Router()

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

module.exports = router
