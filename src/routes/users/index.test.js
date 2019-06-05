const config = require('config')
const request = require('supertest')
const bcrypt = require('bcrypt')

const memoryDB = require('../../database/memory')
const app = require('../../app')
const mail = require('../../mail')
const User = require('../../models/User')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('POST /api/users', () => {
  const person = {
    username: 'abc',
    email: 'abc@abc.com',
    password: 'abcabcabc'
  }

  test('should return {status: 400, error: "Username is required", param: "username"} when {}', () =>
    request(app)
      .post('/api/users')
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

  test('should return {status: 400, error: "Username is required", param: "username"} when {email, password}', () =>
    request(app)
      .post('/api/users')
      .send({ ...person, username: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Username is required')
        expect(param).toBe('username')
      }))

  test('should return {status: 400, error: "Email is required", param: "email"} when {username, password}', () =>
    request(app)
      .post('/api/users')
      .send({ ...person, email: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Email is required')
        expect(param).toBe('email')
      }))

  test('should return {status: 400, error: "Password is required", param: "password"} when {username, email}', () =>
    request(app)
      .post('/api/users')
      .send({ ...person, password: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(res => {
        const { status, error, param } = res.body
        expect(status).toBe(400)
        expect(error).toBe('Password is required')
        expect(param).toBe('password')
      }))

  test('should return {status: 200, data: "Check email address"} when {username, password, email}', () => {
    jest.spyOn(mail, 'send_mail').mockResolvedValue()

    return request(app)
      .post('/api/users')
      .send(person)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const { status, data } = res.body
        expect(status).toBe(200)
        expect(data).toBe('Check email address')
      })
  })
})

describe('POST /api/users/login', () => {
  const person = {
    username: 'mno',
    email: 'mno@mno.com',
    password: 'mnomnomno'
  }

  beforeAll(() =>
    new User({
      ...person,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()
  )

  test('should return {status: 400, error: "Username is required", param: "username"} when {}', () =>
    request(app)
      .post('/api/users/login')
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
      .post('/api/users/login')
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
      .post('/api/users/login')
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

  test('should return {status: 200, data: token} when {username, password}', () =>
    request(app)
      .post('/api/users/login')
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
