const request = require('supertest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const client = require('../../database/redis')
const app = require('../../app')
const memoryDB = require('../../database/memory')
const User = require('../../models/User')
const config = require('config')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('GET /auth/confirm/:auth_key', () => {
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

  test('should return {status: 500, error: "Internal server error"} when /auth/confirm/:wrong_key', () =>
    request(app)
      .get('/auth/confirm/abc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(500)
        expect(error).toBe('Internal server error')
      }))

  test('should return {status: 200, data: token} when /auth/confirm/:auth_key', () =>
    request(app)
      .get(`/auth/confirm/${auth_key}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.split('.').length).toBe(3)
      }))
})

describe('POST /auth/login', () => {
  const person = {
    username: 'mno',
    email: 'mno@mno.com',
    password: 'mnomnomno'
  }

  const different_person = {
    username: 'pqr',
    email: 'pqr@pqr.com',
    password: 'mnomnomno'
  }

  beforeAll(async done => {
    await new User({
      ...person,
      is_authenticated: true,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()

    await new User({
      ...different_person,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()

    done()
  })

  test('should return {status: 400, error: "Username is required", param: "username"} when {}', () =>
    request(app)
      .post('/auth/login')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Username is required')
        expect(param).toBe('username')
      }))

  test('should return {status: 400, error: "Password is required", param: "password"} when {username}', () =>
    request(app)
      .post('/auth/login')
      .send({ username: person.username })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Password is required')
        expect(param).toBe('password')
      }))

  test('should return {status: 400, error: "Username is required", param: "username"} when {password}', () =>
    request(app)
      .post('/auth/login')
      .send({ password: person.password })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Username is required')
        expect(param).toBe('username')
      }))

  test('should return {status: 401, error: "Email address is not confirmed"} when unconfirmed {username, password}', () =>
    request(app)
      .post('/auth/login')
      .send(different_person)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Email address is not confirmed')
      }))

  test('should return {status: 200, data: token} when {username, password}', () =>
    request(app)
      .post('/auth/login')
      .send(person)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data.split('.').length).toBe(3)
      }))
})

describe('GET /auth/logout', () => {
  afterAll(() => client.end(false))

  const token = jsonwebtoken.sign({ id: 123 }, config.get('jwt_secret'), {
    expiresIn: '1m'
  })

  test('should return {status: 200, data: "Logout success"} when (x-auth-token)', () =>
    request(app)
      .get('/auth/logout')
      .set('Accept', 'application/json')
      .set('x-auth-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data).toBe('Logout success')
      }))

  test('should return {status: 401, data: "Authorization required"} when ()', () =>
    request(app)
      .get('/auth/logout')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(res => {
        const { status, error } = res.body
        expect(status).toBe(401)
        expect(error).toBe('Authorization required')
      }))
})
