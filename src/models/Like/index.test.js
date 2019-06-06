const config = require('config')
const memoryDB = require('../../database/memory')
const User = require('../User')
const Post = require('../Post')
const Like = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('Like model', () => {
  let user = null
  let post = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'lorem ipsum'
    }).save()

    done()
  })

  test('should insert like when save with (user, post)', () =>
    new Like({
      user: user.id,
      post: post.id
    })
      .save()
      .then(like => {
        expect(like.user.toString()).toBe(user.id.toString())
        expect(like.post.toString()).toBe(post.id.toString())
        expect(like.created_at).toBeInstanceOf(Date)
        expect(like.updated_at).toBeInstanceOf(Date)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should throw Error("FIELD_REQUIRED") when save with (only user)', () =>
    new Like({
      user: user.id
    })
      .save()
      .then(like => expect(like).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))

  test('should throw Error("FIELD_REQUIRED") when save with (only post)', () =>
    new Like({
      post: post.id
    })
      .save()
      .then(like => expect(like).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))
})
