const router = require('express').Router()
const controller = require('../../controllers/feed')
const middleware = require('../../middlewares/feed')

router.post('/', middleware.post_add, (req, res) =>
  controller
    .add_post(req.user.id, req.body.text)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.put('/:post_id', middleware.post_update, (req, res) =>
  controller
    .update_post(req.user.id, req.params.post_id, req.body.text)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/:post_id', middleware.post_get, (req, res) =>
  controller
    .get_post(req.params.post_id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/:post_id/likes/:page', middleware.likes_get, (req, res) =>
  controller
    .get_likes(req.params.post_id, req.params.page)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/:post_id/comments/:page', middleware.comments_get, (req, res) =>
  controller
    .get_comments(req.params.post_id, req.params.page)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/all/:page', middleware.posts_get, (req, res) =>
  controller
    .get_posts(req.params.page)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.get('/user/:user_id/:page', middleware.posts_get, (req, res) =>
  controller
    .get_user_posts(req.params.user_id, req.params.page)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.delete('/:post_id', middleware.post_remove, (req, res) =>
  controller
    .remove_post(req.user.id, req.params.post_id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.put('/:post_id/like', middleware.like, (req, res) =>
  controller
    .like(req.user.id, req.params.post_id)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.post('/:post_id/comment', middleware.comment_add, (req, res) =>
  controller
    .add_comment(req.user.id, req.params.post_id, req.body.text)
    .then(response => res.status(response.status).json(response))
    .catch(response => res.status(response.status).json(response))
)

router.put(
  '/:post_id/comment/:comment_id',
  middleware.comment_update,
  (req, res) =>
    controller
      .update_comment(
        req.user.id,
        req.params.post_id,
        req.params.comment_id,
        req.body.text
      )
      .then(response => res.status(response.status).json(response))
      .catch(response => res.status(response.status).json(response))
)

router.delete(
  '/:post_id/comment/:comment_id',
  middleware.comment_remove,
  (req, res) =>
    controller
      .remove_comment(req.user.id, req.params.post_id, req.params.comment_id)
      .then(response => res.status(response.status).json(response))
      .catch(response => res.status(response.status).json(response))
)

module.exports = router
