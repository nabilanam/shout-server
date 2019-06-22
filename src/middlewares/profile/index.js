const multer = require('multer')
const config = require('config')
const sharp = require('sharp')
const path = require('path')
const response = require('../../controllers/response')
const { verify } = require('../auth')

const resize = (buffer, user_id) => {
  const file_name = user_id.toString()
  return sharp(buffer)
    .resize(config.get('image_dimension'))
    .toFile(path.join(config.get('image_directory'), file_name))
    .then(() => file_name)
}

const upload_picture = multer({
  limits: { fileSize: config.get('image_max_filesize') }
}).single('picture')

const upload = [
  verify,
  (req, res, next) => {
    upload_picture(req, res, async error => {
      const resp = response.internal_server_error()
      if (error) return res.status(resp.status).json(resp)
      if (req.file) {
        try {
          await resize(req.file.buffer, req.user.id)
        } catch (error) {
          return res.status(resp.status).json(resp)
        }
      }
      next()
    })
  }
]

module.exports = {
  upload
}
