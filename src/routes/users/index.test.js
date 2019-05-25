const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')

describe('POST /api/users', () => {
  test('should return 400 status when data is empty', () =>
    request(app)
      .post('/api/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400))

  test('should return 400 status when username is not provided', () =>
    request(app)
      .post('/api/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('username')
      }))

  test('should return 400 status when email is not provided', () =>
    request(app)
      .post('/api/users')
      .send({ username: 'abc' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('email')
      }))

  test('should return 400 status when password is not provided', () =>
    request(app)
      .post('/api/users')
      .send({ username: 'abc', email: 'abc@abc.com' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        expect(res.body.param).toBe('password')
      }))

  test('should return 200 status when all data is provided', () => {
    jest
      .spyOn(User.prototype, 'save')
      .mockImplementation(() => Promise.resolve({ id: 123 }))

    return request(app)
      .post('/api/users')
      .send({ username: 'abc', email: 'abc@abc.com', password: 'g45aw65w' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
  })
})
