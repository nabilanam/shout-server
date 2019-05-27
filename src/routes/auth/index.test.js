const request = require('supertest')

const app = require('../../app')
const memoryDB = require('../../database/memory')
const User = require('../../models/User')
const config = require('config')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('GET /auth/:auth_key', () => {
  let auth_key = null

  beforeAll(() =>
    new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user => (auth_key = user.auth_key))
  )

  test('should return {status: 500, error: "Internal server error"} when /auth', () =>
    request(app)
      .get('/auth')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(500)
        expect(error).toBe('Internal server error')
      }))

  test('should return {status: 500, error: "Internal server error"} when /auth/:wrong_key', () =>
    request(app)
      .get('/auth/abc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(500)
        expect(error).toBe('Internal server error')
      }))

  test('should return {status: 200, data: token} when /auth/:auth_key', () =>
    request(app)
      .get(`/auth/${auth_key}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.split('.').length).toBe(3)
      }))
})
