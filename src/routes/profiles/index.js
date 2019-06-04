const router = require('express').Router()
const auth = require('../../middlewares/auth')
const controller = require('../../controllers/profile')
const { bad_request } = require('../../controllers/response')

router.get('/', auth, (req, res) => {
  const response = bad_request()
  res.status(response.status).json(response)
})

router.get('/:username', auth, (req, res) => {
  const username = req.params.username

  return controller
    .get(username)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

router.post('/update', auth, (req, res) => {
  const { username, password, email, bio, quote, social } = req.body

  return controller
    .update(req.user, username, password, email, bio, quote, social)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

module.exports = router
