const router = require('express').Router()
const { verify } = require('../../middlewares/auth')
const { upload } = require('../../middlewares/profile')
const controller = require('../../controllers/profile')
const { bad_request } = require('../../controllers/response')

router.get('/', verify, (req, res) => {
  const response = bad_request()
  res.status(response.status).json(response)
})

router.get('/:username', verify, (req, res) => {
  const username = req.params.username

  return controller
    .get(username, req.user.id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

router.get('/id/:userId', verify, (req, res) => {
  return controller
    .getByUserId(req.params.userId, req.user.id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

router.get('/:user_id/picture', verify, (req, res) =>
  controller
    .get_picture(req.params.user_id)
    .then(response => res.contentType('image/png').sendFile(response.data))
    .catch(response => res.status(response.status).json(response))
)

router.post('/update', upload, (req, res) => {
  const {
    username,
    firstname,
    lastname,
    password,
    email,
    bio,
    quote,
    social
  } = req.body

  return controller
    .update(
      req.user,
      username,
      firstname,
      lastname,
      password,
      email,
      bio,
      quote,
      social
    )
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
})

module.exports = router
