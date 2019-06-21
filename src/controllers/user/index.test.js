const memoryDB = require('../../database/memory')
const config = require('config')
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

  test('should reject ErrorResponse with (400, "Username already exists") when (duplicate username)', () =>
    controller
      .create(person.username, person.email + 'x', person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Username already exists')
      }))

  test('should reject ErrorResponse with (400, "Email already exists") when (duplicate email)', () =>
    controller
      .create(person.username + 'x', person.email, person.password)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Email already exists')
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
