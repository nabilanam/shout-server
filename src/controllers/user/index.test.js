const memoryDB = require('../../database/memory')
const controller = require('./index')
const config = require('config')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User controller -> create', () => {
  let person = {
    username: 'abc',
    email: 'abc@abc.com',
    password: 'abc'
  }

  test('should return token (200) when no duplicate entry found', () =>
    controller
      .create(person.username, person.email, person.password)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.split('.').length).toBe(3)
      }))

  test('should return (400) when username or email exists', () =>
    controller
      .create(person.username, person.email, person.password)
      .catch(err => expect(err.status).toBe(400)))

  test('should return (500) for when username undefined', () =>
    controller
      .create(undefined, person.email, person.password)
      .catch(err => expect(err.status).toBe(500)))

  test('should return (500) for when email undefined', () =>
    controller
      .create(person.username, undefined, person.password)
      .catch(err => expect(err.status).toBe(500)))

  test('should return (500) for when password undefined', () =>
    controller
      .create(person.username, person.email, undefined)
      .catch(err => expect(err.status).toBe(500)))

  test('should return (500) for when no data provided', () =>
    controller.create().catch(err => expect(err.status).toBe(500)))
})
