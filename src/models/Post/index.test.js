const config = require('config')
const memoryDB = require('../../database/memory')
const User = require('../User')
const Post = require('../Post')
const Like = require('../Like')
const Comment = require('../Comment')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('Post model', () => {
  let user = null
  let post = null
  let like = null
  let comment = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'lorem'
    }).save()

    like = await new Like({
      user: user.id,
      post: post.id
    }).save()

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'ipsum'
    }).save()

    done()
  })

  test('should insert post when save with (user, text)', () =>
    new Post({
      user: user.id,
      text: 'lorem ipsum!'
    })
      .save()
      .then(p => {
        expect(p.user.toString()).toBe(user.id.toString())
        expect(p.text).toBe('lorem ipsum!')
        expect(p.created_at).toBeInstanceOf(Date)
        expect(p.updated_at).toBeInstanceOf(Date)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should populate user when findById with .populate', () =>
    Post.findById(post.id)
      .populate('user')
      .then(p => expect(p.user.username).toBe('abc'))
      .catch(error => expect(error).toBeUndefined()))

  test('should insert like when findByIdAndUpdate with (like)', () =>
    Post.findByIdAndUpdate(
      post.id,
      { $push: { likes: like.id } },
      { new: true }
    )
      .then(p => expect(p.likes[0].toString()).toBe(like.id.toString()))
      .catch(error => expect(error).toBeUndefined()))

  test('should remove like when findByIdAndUpdate with (like)', () =>
    Post.findByIdAndUpdate(
      post.id,
      { $pull: { likes: like.id } },
      { new: true }
    )
      .then(p => expect(p.likes.length).toBe(0))
      .catch(error => expect(error).toBeUndefined()))

  test('should insert comment when findByIdAndUpdate with (comment)', () =>
    Post.findByIdAndUpdate(
      post.id,
      { $push: { comments: comment } },
      { new: true }
    )
      .then(p => {
        expect(p.comments.length).toBe(1)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should remove comment when findByIdAndUpdate with (comment)', () =>
    Post.findByIdAndUpdate(
      post.id,
      { $pull: { comments: comment.id } },
      { new: true }
    )
      .then(p => {
        expect(p.comments.length).toBe(0)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should throw Error("FIELD_REQUIRED") when save with (only user)', () =>
    new Post({
      user: user.id
    })
      .save()
      .then(p => expect(p).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))

  test('should throw Error("FIELD_REQUIRED") when save with (only text)', () =>
    new Post({
      text: 'lorem ipsum!'
    })
      .save()
      .then(p => expect(p).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))
})
