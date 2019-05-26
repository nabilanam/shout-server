const config = require('config')
const request = require('supertest')

const memoryDB = require('../../database/memory')
const app = require('../../app')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('POST /api/users', () => {
  test('should return (400) when data is empty', () =>
    request(app)
      .post('/api/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400))

  test('should return (400) when username is not provided', () =>
    request(app)
      .post('/api/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('username')
      }))

  test('should return (400) when email is not provided', () =>
    request(app)
      .post('/api/users')
      .send({ username: 'abc' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('email')
      }))

  test('should return (400) when password is not provided', () =>
    request(app)
      .post('/api/users')
      .send({ username: 'abc', email: 'abc@abc.com' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('password')
      }))

  test('should return (200) when all data is provided', () =>
    request(app)
      .post('/api/users')
      .send({ username: 'abc', email: 'abc@abc.com', password: 'g45aw65w' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200))
})
