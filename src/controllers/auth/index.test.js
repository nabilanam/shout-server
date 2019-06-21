const memoryDB = require('../../database/memory')
const config = require('config')
const bcrypt = require('bcrypt')
const User = require('../../models/User')
const controller = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('auth controller -> login_token', () => {
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

  test('should reject ErrorResponse with (500, "Internal server error") when ()', () =>
    controller.login_token().catch(response => {
      expect(response.status).toBe(500)
      expect(response.error).toBe('Internal server error')
    }))

  test('should reject ErrorResponse with (500, "Internal server error") when (wrong auth_key)', () =>
    controller.login_token('abcde').catch(response => {
      expect(response.status).toBe(500)
      expect(response.error).toBe('Internal server error')
    }))

  test('should resolve Response with (200, data: token) when (auth_key)', () =>
    controller.login_token(auth_key).then(response => {
      expect(response.status).toBe(200)
      expect(response.data.split('.').length).toBe(3)
    }))
})

describe('auth controller -> login', () => {
  const person = {
    username: 'mno',
    email: 'mno@mno.com',
    password: 'mno'
  }

  const different_person = {
    username: 'pqr',
    email: 'pqr@pqr.com',
    password: 'pqr'
  }

  beforeAll(async done => {
    await new User({
      ...person,
      is_authenticated: true,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()

    await new User({
      ...different_person,
      password: bcrypt.hashSync(
        different_person.password,
        config.get('salt_rounds')
      )
    }).save()

    done()
  })

  test('should resolve Response with (200, token) when (username, password)', () =>
    controller
      .login(person.username, person.password)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.split('.').length).toBe(3)
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (401, "Email address is not confirmed") when unauthenticated (username, password)', () =>
    controller
      .login(different_person.username, different_person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(401)
        expect(response.error).toBe('Email address is not confirmed')
      }))

  test('should reject ErrorResponse with (401, "Wrong login credentials") when (wrong username, password)', () =>
    controller
      .login(person.username + 'x', person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(401)
        expect(response.error).toBe('Wrong login credentials')
      }))

  test('should reject ErrorResponse with (401, "Wrong login credentials") when (username, wrong password)', () =>
    controller
      .login(person.username, person.password + 'x')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(401)
        expect(response.error).toBe('Wrong login credentials')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") when ()', () =>
    controller
      .login()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})
