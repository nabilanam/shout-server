const memoryDB = require('../../database/memory')
const config = require('config')
const bcrypt = require('bcrypt')

const User = require('../../models/User')
const controller = require('./index')
const mail = require('../../mail')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User controller -> create', () => {
  let person = {
    username: 'abc',
    email: 'abc@abc.com',
    password: 'abc'
  }

  test('should resolve Response with (200, "Check email address") when (username, email, password)', () => {
    jest.spyOn(mail, 'send_mail').mockResolvedValue()

    return controller
      .create(person.username, person.email, person.password)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toBe('Check email address')
      })
      .catch(error => expect(error).toBeUndefined())
  })

  test('should reject ErrorResponse with (400, "Username or email already exists") when (duplicate username)', () =>
    controller
      .create(person.username, person.email + 'x', person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Username or email already exists')
      }))

  test('should reject ErrorResponse with (400, "Username or email already exists") when (duplicate email)', () =>
    controller
      .create(person.username + 'x', person.email, person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Username or email already exists')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") for when (username, password)', () =>
    controller
      .create(person.username, undefined, person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") for when (username, email)', () =>
    controller
      .create(person.username, person.email)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") for when (email, password)', () =>
    controller
      .create(undefined, person.email, person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") for when ()', () =>
    controller
      .create()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

describe('User controller -> login', () => {
  const person = {
    username: 'mno',
    email: 'mno@mno.com',
    password: 'mno'
  }

  beforeAll(() =>
    new User({
      ...person,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()
  )

  test('should resolve Response with (200, token) when (username, password)', () =>
    controller
      .login(person.username, person.password)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.split('.').length).toBe(3)
      })
      .catch(response => expect(response).toBeUndefined()))

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
