const memoryDB = require('../../database/memory')
const config = require('config')
const bcrypt = require('bcrypt')

const controller = require('./index')
const ErrorResponse = require('../../response/ErrorResponse')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User controller -> create', () => {
  let person = {
    username: 'abc',
    email: 'abc@abc.com',
    password: 'abc'
  }
  const mock_error_response = new ErrorResponse(400, 'Invalid request')

  test('should resolve Response with (200, token) when (username, email, password)', () =>
    controller
      .create(person.username, person.email, person.password)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.split('.').length).toBe(3)
      }))

  test('should reject ErrorResponse with (400, "Username or email already exists") when (username) exists', () =>
    controller
      .create(person.username, person.email + 'x', person.password)
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Username or email already exists')
      }))

  test('should reject ErrorResponse with (400, "Username or email already exists") when (email) exists', () =>
    controller
      .create(person.username + 'x', person.email, person.password)
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Username or email already exists')
      }))

  test('should reject ErrorResponse with (400, "Invalid request") for when (email, password)', () =>
    controller
      .create(undefined, person.email, person.password)
      .catch(response => expect(response).toEqual(mock_error_response)))

  test('should reject ErrorResponse with (400, "Invalid request") for when (username, password)', () =>
    controller
      .create(person.username, undefined, person.password)
      .catch(response => expect(response).toEqual(mock_error_response)))

  test('should reject ErrorResponse with (400, "Invalid request") for when (username, email)', () =>
    controller
      .create(person.username, person.email)
      .catch(response => expect(response).toEqual(mock_error_response)))

  test('should reject ErrorResponse with (400, "Invalid request") for when ()', () =>
    controller
      .create()
      .catch(response => expect(response).toEqual(mock_error_response)))
})

describe('User controller -> login', () => {
  const person = {
    username: 'mno',
    email: 'mno@mno.com',
    password: 'mno'
  }

  const mock_error_response = new ErrorResponse(401, 'Wrong login credentials')

  beforeAll(() =>
    new User({
      ...person,
      password: bcrypt.hashSync(person.password, config.get('salt_rounds'))
    }).save()
  )

  test('should resolve Response with (200, token) when (username, password)', () =>
    controller.login(person.username, person.password).then(response => {
      expect(response.status).toBe(200)
      expect(response.data.split('.').length).toBe(3)
    }))

  test("should reject ErrorResponse with (401, 'Wrong login credentials') when (wrong username, password)", () =>
    controller
      .login(person.username + 'x', undefined, person.password)
      .catch(response => expect(response).toEqual(mock_error_response)))

  test("should reject ErrorResponse with (401, 'Wrong login credentials') when (username, wrong password)", () =>
    controller
      .login(person.username, undefined, person.password + 'x')
      .catch(response => expect(response).toEqual(mock_error_response)))

  test("should reject ErrorResponse with (401, 'Wrong login credentials') when ()", () =>
    controller
      .login()
      .catch(response => expect(response).toEqual(mock_error_response)))
})
