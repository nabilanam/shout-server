const config = require('config')
const Post = require('../../models/Post')
const Like = require('../../models/Like')
const Comment = require('../../models/Comment')
const response = require('../response')

const feed_limit = config.get('feed_limit')
const like_limit = config.get('like_limit')
const comment_limit = config.get('comment_limit')

const pop_user = {
  path: 'user',
  select: 'firstname lastname username'
}

const add_post = async (user_id, text) => {
  if (!(user_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const post = await new Post({
    user: user_id,
    text
  }).save()

  return Post.findById(post.id)
    .populate(pop_user)
    .then(post => {
      post._doc.isLiked = false
      return response.ok(post)
    })
    .catch(() => Promise.reject(response.internal_server_error()))
}

const querPostLike = async (user_id, post) => {
  post._doc.isLiked = !!(await Like.findOne({
    user: user_id,
    post: post.id
  }))
  return post
}

const update_post = async (user_id, post_id, text) => {
  if (!(user_id && post_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const post = await Post.findById(post_id).populate(pop_user)

  if (!post) return Promise.reject(response.not_found())
  if (post.user.id !== user_id) return Promise.reject(response.access_denied())

  post.text = text

  return post
    .save()
    .then(async post => {
      post = await querPostLike(user_id, post)
      return response.ok(post)
    })
    .catch(() => Promise.reject(response.internal_server_error()))
}

const get_post = (user_id, post_id) => {
  if (!(user_id && post_id)) return Promise.reject(response.bad_request())

  return Post.findById(post_id)
    .populate(pop_user)
    .then(async post => {
      if (!post) throw new Error()
      post = await querPostLike(user_id, post)
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

const queryPostslike = async (user_id, posts) => {
  for (let post of posts) {
    const isLiked = await Like.findOne({
      user: user_id,
      post: post.id
    })
    if (post._doc) post._doc.isLiked = !!isLiked
    else post.isLiked = !!isLiked
  }
  return posts
}

const get_posts = (user_id, page) => {
  if (!page || page < 0) return Promise.reject(response.bad_request())

  return Post.find()
    .sort({ created_at: -1 })
    .skip(feed_limit * (page - 1))
    .limit(feed_limit)
    .populate(pop_user)
    .then(async posts => {
      posts = await queryPostslike(user_id, posts)
      return response.ok(posts)
    })
    .catch(() => Promise.reject(response.internal_server_error()))
}

const get_posts_by_username = async (current_user_id, username, page) => {
  if (!username || !page || page < 0)
    return Promise.reject(response.bad_request())

  return Post.aggregate()
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user'
    })
    .unwind('user')
    .match({ 'user.username': username })
    .sort({ created_at: -1 })
    .skip(feed_limit * (page - 1))
    .limit(feed_limit)
    .project({
      'user.is_authenticated': 0,
      'user.password': 0,
      'user.email': 0,
      'user.auth_key': 0,
      'user.created_at': 0,
      'user.updated_at': 0,
      'user.__v': 0
    })
    .then(async posts => {
      posts = await queryPostslike(current_user_id, posts)
      return response.ok(posts)
    })
    .catch(() => Promise.reject(response.internal_server_error()))
}

const like = async (user_id, post_id) => {
  if (!(user_id && post_id)) return Promise.reject(response.bad_request())

  const like = await Like.findOne({ user: user_id, post: post_id })

  const previouslyLiked = !!like

  previouslyLiked
    ? await like.remove()
    : await new Like({ user: user_id, post: post_id }).save()

  return Post.findByIdAndUpdate(
    post_id,
    { $inc: { likes: previouslyLiked ? -1 : 1 } },
    { new: true }
  )
    .then(post => response.ok({ isLiked: !previouslyLiked, count: post.likes }))
    .catch(() => Promise.reject(response.not_found()))
}

const get_likes = (post_id, page) => {
  if (!page || page < 0) return Promise.reject(response.bad_request())

  return Like.find({ post: post_id })
    .sort({ created_at: 1 })
    .skip(like_limit * (page - 1))
    .limit(like_limit)
    .populate(pop_user)
    .then(likes => response.ok(likes))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const add_comment = async (user_id, post_id, text) => {
  if (!(user_id && post_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  let comment = await new Comment({
    user: user_id,
    post: post_id,
    text
  }).save()

  comment = await Comment.findById(comment.id).populate(pop_user)

  return Post.findByIdAndUpdate(
    post_id,
    { $inc: { comments: 1 } },
    { new: true }
  )
    .then(post => response.ok({ comment, count: post.comments }))
    .catch(() => Promise.reject(response.not_found()))
}

const update_comment = async (user_id, post_id, comment_id, text) => {
  if (!(user_id && post_id && comment_id && text && (text = text.trim())))
    return Promise.reject(response.bad_request())

  const comment = await Comment.findById(comment_id).populate(pop_user)

  if (!comment) return Promise.reject(response.not_found())
  else if (comment.user.id != user_id || comment.post != post_id)
    return Promise.reject(response.access_denied())

  comment.text = text
  await comment.save()

  return Post.findById(post_id)
    .then(post => response.ok({ comment, count: post.comments }))
    .catch(() => Promise.reject(response.internal_server_error()))
}

const get_comments = (post_id, page) => {
  if (!page || page < 0) return Promise.reject(response.bad_request())

  return Comment.find({ post: post_id })
    .sort({ created_at: -1 })
    .skip(comment_limit * (page - 1))
    .limit(comment_limit)
    .populate(pop_user)
    .then(comments => response.ok(comments))
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

  return Post.findByIdAndUpdate(
    post_id,
    { $inc: { comments: -1 } },
    { new: true }
  )
    .then(post => response.ok({ count: post.comments }))
    .catch(() => Promise.reject(response.internal_server_error()))
}

module.exports = {
  add_post,
  update_post,
  get_posts,
  get_posts_by_username,
  get_post,
  remove_post,
  like,
  get_likes,
  add_comment,
  update_comment,
  get_comments,
  remove_comment
}
