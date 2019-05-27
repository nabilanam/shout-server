const memoryDB = require('../../database/memory')
const config = require('config')

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
