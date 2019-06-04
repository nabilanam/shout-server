const config = require('config')
const memoryDB = require('../../database/memory')
const User = require('../../models/User')
const controller = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('profile controller -> get', () => {
  beforeAll(() =>
    new User({ username: 'abc', email: 'abc@abc.com', password: '123' }).save()
  )

  test('should resolve when (username)', () =>
    controller
      .get('abc')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.username).toBe('abc')
        expect(response.data.email).toBe('abc@abc.com')
        expect(response.data._id).toBeUndefined()
        expect(response.data.__v).toBeUndefined()
        expect(response.data.password).toBeUndefined()
        expect(response.data.auth_key).toBeUndefined()
        expect(response.data.created_at).toBeUndefined()
        expect(response.data.updated_at).toBeUndefined()
        expect(response.data.is_authenticated).toBeUndefined()
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (404, "User not found") when (wrong username)', () =>
    controller
      .get('xyz')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('User not found')
      }))

  test('should reject ErrorResponse with (500, "Internal server error") when ()', () =>
    controller
      .get()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(500)
        expect(response.error).toBe('Internal server error')
      }))
})

describe('profile controller -> update', () => {
  let user = null

  beforeAll(() =>
    new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: '123'
    })
      .save()
      .then(u => (user = u))
  )

  test('should resolve when (user)', () =>
    controller
      .update(user)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.username).toBe('mno')
        expect(response.data.email).toBe('mno@mno.com')
        expect(response.data._id).toBeUndefined()
        expect(response.data.__v).toBeUndefined()
        expect(response.data.password).toBeUndefined()
        expect(response.data.auth_key).toBeUndefined()
        expect(response.data.created_at).toBeUndefined()
        expect(response.data.updated_at).toBeUndefined()
        expect(response.data.is_authenticated).toBeUndefined()
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (500, "Internal server error") when ()', () =>
    controller
      .update()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(500)
        expect(response.error).toBe('Internal server error')
      }))
})
