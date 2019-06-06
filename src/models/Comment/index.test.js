const config = require('config')
const memoryDB = require('../../database/memory')
const User = require('../User')
const Post = require('../Post')
const Comment = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('Comment model', () => {
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

  test('should insert comment when save with (user, post, text)', () =>
    new Comment({
      user: user.id,
      post: post.id,
      text: 'lorem ipsum'
    })
      .save()
      .then(c => {
        expect(c.user.toString()).toBe(user.id.toString())
        expect(c.post.toString()).toBe(post.id.toString())
        expect(c.created_at).toBeInstanceOf(Date)
        expect(c.updated_at).toBeInstanceOf(Date)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should throw Error("FIELD_REQUIRED") when save with (user)', () =>
    new Comment({
      user: user.id
    })
      .save()
      .then(c => expect(c).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))

  test('should throw Error("FIELD_REQUIRED") when save with (user, post)', () =>
    new Comment({
      user: user.id,
      post: post.id
    })
      .save()
      .then(c => expect(c).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))

  test('should throw Error("FIELD_REQUIRED") when save with (post, text)', () =>
    new Comment({
      post: post.id,
      text: 'lorem'
    })
      .save()
      .then(c => expect(c).toBeUndefined())
      .catch(error => expect(error.message).toBe('FIELD_REQUIRED')))
})
