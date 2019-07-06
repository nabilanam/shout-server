const request = require('supertest')
const config = require('config')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const memoryDB = require('../../database/memory')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const app = require('../../app')
const client = require('../../database/redis')

let user = null
let token = null

beforeAll(async done => {
  await memoryDB.start()

  user = await new User({
    username: 'abc',
    email: 'abc@abc.com',
    password: bcrypt.hashSync('mno', config.get('salt_rounds')),
    is_authenticated: true
  }).save()

  token = jsonwebtoken.sign({ id: user.id }, config.get('jwt_secret'), {
    expiresIn: '1m'
  })

  done()
}, config.get('timeout'))

afterAll(async done => {
  await memoryDB.stop()
  await client.end(false)
  done()
})

describe('POST /api/feed/', () => {
  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .post('/api/feed')
      .set('Accept', 'application/json')
      .send({ text: 'lorem ipsum' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'post can\'t be empty\'} when no {text}', () =>
    request(app)
      .post('/api/feed')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('post can\'t be empty')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: post} when {text: \'lorem ipsum\'}', () =>
    request(app)
      .post('/api/feed')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'lorem ipsum' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.text).toBe('lorem ipsum')
        expect(data.user._id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('PUT /api/feed/:post_id', () => {
  let post = null
  beforeAll(() =>
    new Post({ user: user.id, text: 'lorem ipsum' })
      .save()
      .then(p => (post = p))
  )

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .put('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .put('/api/feed/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'post can\'t be empty\'} when no {text}', () =>
    request(app)
      .put('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('post can\'t be empty')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: post} when {text: \'dolor sit amet\'}', () =>
    request(app)
      .put('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.text).toBe('dolor sit amet')
        expect(data.user._id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('GET /api/feed/:post_id', () => {
  let post = null
  beforeAll(() =>
    new Post({ user: user.id, text: 'lorem ipsum' })
      .save()
      .then(p => (post = p))
  )

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .get('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .get('/api/feed/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: post} when /:post_id', () =>
    request(app)
      .get('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.text).toBe('lorem ipsum')
        expect(data.user._id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('GET /api/feed/all/:page', () => {
  beforeAll(() => new Post({ user: user.id, text: 'lorem ipsum' }).save())

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .get('/api/feed/all/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid page number\'} when /:page is 0', () =>
    request(app)
      .get('/api/feed/all/0')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid page number')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid page number\'} when invalid /:page', () =>
    request(app)
      .get('/api/feed/all/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid page number')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: [post]} when /:page', () =>
    request(app)
      .get('/api/feed/all/1')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data).toBeInstanceOf(Array)
        expect(data.length).toBe(1)
        expect(data[0].user._id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('GET /api/feed/:username/:page', () => {
  beforeAll(() => new Post({ user: user.id, text: 'lorem ipsum' }).save())

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .get('/api/feed/' + user.username + '/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid page number\'} when /:page is 0', () =>
    request(app)
      .get('/api/feed/' + user.username + '/0')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid page number')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid page number\'} when invalid /:page', () =>
    request(app)
      .get('/api/feed/' + user.username + '/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid page number')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: [post]} when /:page', () =>
    request(app)
      .get('/api/feed/' + user.username + '/1')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data).toBeInstanceOf(Array)
        expect(data.length).toBe(1)
        expect(data[0].user._id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('DELETE /api/feed/:post_id', () => {
  let post = null
  beforeAll(() =>
    new Post({ user: user.id, text: 'lorem ipsum' })
      .save()
      .then(p => (post = p))
  )

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .delete('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .delete('/api/feed/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: \'Post delete success\'} when /:post_id', () =>
    request(app)
      .delete('/api/feed/' + post.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data).toBe('Post delete success')
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('PUT /api/feed/:post_id/like', () => {
  let post = null
  beforeAll(() =>
    new Post({ user: user.id, text: 'lorem ipsum' })
      .save()
      .then(p => (post = p))
  )

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .put('/api/feed/' + post.id + '/like')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .put('/api/feed/1a/like')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: 1} when /:post_id/like', () =>
    request(app)
      .put('/api/feed/' + post.id + '/like')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.count).toBe(1)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: 0} when same /:post_id/like', () =>
    request(app)
      .put('/api/feed/' + post.id + '/like')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.count).toBe(0)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('POST /api/feed/:post_id/comment', () => {
  let post = null
  beforeAll(() =>
    new Post({ user: user.id, text: 'lorem ipsum' })
      .save()
      .then(p => (post = p))
  )

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .post('/api/feed/' + post.id + '/comment')
      .set('Accept', 'application/json')
      .send({ text: 'lorem ipsum' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .post('/api/feed/1a/comment')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'lorem ipsum' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'comment can\'t be empty\'} when no {text}', () =>
    request(app)
      .post('/api/feed/' + post.id + '/comment')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('comment can\'t be empty')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: {count: 1}} when {text: \'lorem ipsum\'}', () =>
    request(app)
      .post('/api/feed/' + post.id + '/comment')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'lorem ipsum' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.count).toBe(1)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('PUT /api/feed/:post_id/comment/:comment_id', () => {
  let post = null
  let comment = null

  beforeAll(async done => {
    post = await new Post({
      user: user.id,
      text: 'lorem ipsum',
      comments: 1
    }).save()

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lorem ipsum'
    }).save()

    await post.save()

    done()
  })

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .put('/api/feed/' + post.id + '/comment/' + comment.id)
      .set('Accept', 'application/json')
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid post_id\'} when invalid /:post_id', () =>
    request(app)
      .put('/api/feed/1a/comment/' + comment.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid post_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'invalid comment_id\'} when invalid /:comment_id', () =>
    request(app)
      .put('/api/feed/' + post.id + '/comment/1a')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('invalid comment_id')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: \'comment can\'t be empty\'} when no {text}', () =>
    request(app)
      .put('/api/feed/' + post.id + '/comment/' + comment.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('comment can\'t be empty')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: {count: 1}} when /:post_id/comment/:comment_id with {text: \'dolor sit amet\'}', () =>
    request(app)
      .put('/api/feed/' + post.id + '/comment/' + comment.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ text: 'dolor sit amet' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.count).toBe(1)
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('DELETE /api/feed/:post_id/comment/:comment_id', () => {
  let post = null
  let comment = null

  beforeAll(async done => {
    post = await new Post({
      user: user.id,
      text: 'lorem ipsum',
      comments: 1
    }).save()

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lorem ipsum'
    }).save()

    await post.save()

    done()
  })

  afterAll(() => Post.deleteMany({}))

  test('should return {status: 401, error: \'Authorization required\'} when no x-auth-token', () =>
    request(app)
      .delete('/api/feed/' + post.id + '/comment/' + comment.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 200, data: {count: 0}} when /:post_id/comment/:comment_id with {text: \'dolor sit amet\'}', () =>
    request(app)
      .delete('/api/feed/' + post.id + '/comment/' + comment.id)
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.count).toBe(0)
      })
      .catch(error => expect(error).toBeUndefined()))
})
