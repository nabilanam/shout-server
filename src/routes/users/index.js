const express = require('express')
const router = express.Router()

const middleware = require('../../middlewares/user')
const controller = require('../../controllers/user')

router.post('/', middleware.create, (req, res) => {
  const { username, email, password } = req.body

  return controller
    .create(username, email, password)
    .then(response => res.status(response.status).json({ data: response.data }))
    .catch(response =>
      res.status(response.status).json({ error: response.error })
    )
})

module.exports = router
