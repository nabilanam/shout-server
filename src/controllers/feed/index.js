const feed_limit = require('config').get('feed_limit')
const Post = require('../../models/Post')
const Like = require('../../models/Like')
const Comment = require('../../models/Comment')
const response = require('../response')

const pop_user = {
  path: 'user',
  select: 'firstname lastname username picture'
}

const pop_likes = {
  path: 'likes',
  populate: pop_user,
  options: { sort: { created_at: -1 } }
}

const pop_comments = {
  path: 'comments',
  populate: pop_user,
  options: { sort: { created_at: -1 } }
}

const add_post = (user_id, text) => {
  if (!(user_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  return new Post({
    user: user_id,
    text
  })
    .save()
    .then(post => response.ok(post))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const update_post = async (user_id, post_id, text) => {
  if (!(user_id && post_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const post = await Post.findById(post_id).populate([
    pop_user,
    pop_likes,
    pop_comments
  ])

  if (!post) return Promise.reject(response.not_found())
  if (post.user.id !== user_id) return Promise.reject(response.access_denied())

  post.text = text

  return post
    .save()
    .then(post => response.ok(post))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const get_post = async post_id => {
  if (!post_id) return Promise.reject(response.bad_request())

  return Post.findById(post_id)
    .populate([pop_user, pop_likes, pop_comments])
    .then(post => {
      if (!post) throw new Error()
      return response.ok(post)
    })
    .catch(() => Promise.reject(response.not_found()))
}

const remove_post = async (user_id, post_id) => {
  if (!(user_id && post_id)) return Promise.reject(response.bad_request())

  const post = await Post.findById(post_id).populate(
    'user',
    'firstname lastname username picture'
  )

  if (!post) return Promise.reject(response.not_found())
  if (post.user.id !== user_id) return Promise.reject(response.access_denied())

  return post
    .remove()
    .then(() => response.ok('Post delete success'))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const get_posts = page => {
  if (!page || page < 0) return Promise.reject(response.bad_request())

  return Post.find()
    .sort({ created_at: -1 })
    .skip(feed_limit * (page - 1))
    .limit(feed_limit)
    .populate([pop_user, pop_likes, pop_comments])
    .then(posts => response.ok(posts))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const like = async (user_id, post_id) => {
  if (!(user_id && post_id)) return Promise.reject(response.bad_request())

  let like = await Like.findOne({ user: user_id, post: post_id })

  like = like
    ? await like.remove()
    : await new Like({ user: user_id, post: post_id }).save()

  return Post.findByIdAndUpdate(
    post_id,
    { $addToSet: { likes: like } },
    { new: true }
  )
    .populate(pop_likes)
    .then(post => response.ok(post.likes))
    .catch(() => Promise.reject(response.not_found()))
}

const add_comment = async (user_id, post_id, text) => {
  if (!(user_id && post_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const comment = await new Comment({
    user: user_id,
    post: post_id,
    text
  }).save()

  return Post.findByIdAndUpdate(
    post_id,
    { $push: { comments: comment.id } },
    { new: true }
  )
    .populate(pop_comments)
    .then(post => response.ok(post.comments))
    .catch(() => Promise.reject(response.not_found()))
}

const update_comment = async (user_id, post_id, comment_id, text) => {
  if (!(user_id && post_id && comment_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const comment = await Comment.findById(comment_id)

  if (!comment) return Promise.reject(response.not_found())
  else if (comment.user != user_id || comment.post != post_id)
    return Promise.reject(response.access_denied())

  comment.text = text
  await comment.save()

  return Post.findById(post_id)
    .populate(pop_comments)
    .then(post => response.ok(post.comments))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const remove_comment = async (user_id, post_id, comment_id) => {
  if (!(user_id && post_id && comment_id))
    return Promise.reject(response.bad_request())

  const comment = await Comment.findById(comment_id)

  if (!comment) return Promise.reject(response.not_found())
  else if (comment.user != user_id || comment.post != post_id)
    return Promise.reject(response.access_denied())

  await comment.remove()

  return Post.findByIdAndUpdate(post_id, { $pull: { comments: comment.id } })
    .populate(pop_comments)
    .then(post => response.ok(post.comments))
    .catch(() => Promise.reject(response.internal_server_error()))
}

module.exports = {
  add_post,
  update_post,
  get_posts,
  get_post,
  remove_post,
  like,
  add_comment,
  update_comment,
  remove_comment
}
