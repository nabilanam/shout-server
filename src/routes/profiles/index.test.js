const config = require('config')
const bcrypt = require('bcrypt')
const request = require('supertest')
const jsonwebtoken = require('jsonwebtoken')

const app = require('../../app')
const memoryDB = require('../../database/memory')
const User = require('../../models/User')

let user = null
let token = null

beforeAll(
  () =>
    memoryDB.start().then(() =>
      new User({
        username: 'abc',
        email: 'abc@abc.com',
        password: bcrypt.hashSync('mno', config.get('salt_rounds'))
      })
        .save()
        .then(u => {
          user = u
          token = jsonwebtoken.sign({ id: user.id }, config.get('jwt_secret'), {
            expiresIn: '1m'
          })
        })
    ),
  config.get('timeout')
)
afterAll(() => memoryDB.stop())

describe('GET /api/profiles/', () => {
  test('should return {status: 200, data: profile} when /:username', () =>
    request(app)
      .get('/api/profiles/abc')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.username).toBe('abc')
        expect(data.email).toBe('abc@abc.com')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 404, error: "User not found"} when /:wrong_username', () =>
    request(app)
      .get('/api/profiles/xyz')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(404)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(404)
        expect(error).toBe('User not found')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 400, error: "Invalid request"} when /', () =>
    request(app)
      .get('/api/profiles/')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Invalid request')
      })
      .catch(error => expect(error).toBeUndefined()))
})

describe('POST /api/profiles/update', () => {
  test('should return {status: 200, data: profile} when {token, username}', () =>
    request(app)
      .post('/api/profiles/update')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .send({ username: 'mno' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.username).toBe('mno')
        expect(data.email).toBe('abc@abc.com')
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return {status: 401, error: "Authorization required"} when {no token}', () =>
    request(app)
      .get('/api/profiles/update')
      .set('Accept', 'application/json')
      .send({ username: 'abc' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined()))
})
