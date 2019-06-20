const config = require('config')
const md5 = require('md5')

const memoryDB = require('../../database/memory')
const User = require('./index')
const errors = require('../errors')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User model', () => {
  test('should add auth_key,created_at,updated_at when save with new (username, email, password)', () =>
    new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user => {
        expect(user.username).toBe('abc')
        expect(user.auth_key).toBe(md5(user.id))
        expect(user.email).toBe('abc@abc.com')
        expect(user.created_at).toBeInstanceOf(Date)
        expect(user.updated_at).toBeInstanceOf(Date)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should reject Error with (\'username\') when save with (duplicate username)', () =>
    new User({
      username: 'abc',
      email: 'mno@mno.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe('username')))

  test('should reject Error with (\'email\') when save with (duplicate email)', () =>
    new User({
      username: 'mno',
      email: 'abc@abc.com',
      password: 'abcabc'
    })
      .save()
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe('email')))

  test('should reject Error with (FIELD_REQUIRED) when save with (undefined email)', () =>
    new User({ username: 'pqr', password: 'pqr' })
      .save()
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe(errors.FIELD_REQUIRED)))

  test('should reject Error with (FIELD_REQUIRED) when save with (undefined username)', () =>
    new User({ email: 'mno@mno.com', password: 'zyxwvu' })
      .save()
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe(errors.FIELD_REQUIRED)))

  test('should reject Error with (FIELD_REQUIRED) when save with ()', () =>
    new User()
      .save()
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe(errors.FIELD_REQUIRED)))

  test('should resolve when findOneAndUpdate with (new username)', () =>
    User.findOneAndUpdate(
      { username: 'abc' },
      { username: 'abc1' },
      { new: true }
    )
      .then(user => expect(user.username).toBe('abc1'))
      .catch(error => expect(error).toBeUndefined()))

  test('should resolve when findOneAndUpdate with (new email)', () =>
    User.findOneAndUpdate(
      { username: 'abc1' },
      { email: 'abc1@abc.com' },
      { new: true }
    )
      .then(user => expect(user.username).toBe('abc1'))
      .catch(error => expect(error).toBeUndefined()))

  test('should reject Error with (DUPLICATE_KEY) when findOneAndUpdate with (duplicate username)', () =>
    new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: 'mnomno'
    })
      .save()
      .then(user =>
        User.findOneAndUpdate(
          { username: 'abc1' },
          { username: user.username },
          { new: true }
        ).then(user => expect(user).toBeUndefined())
      )
      .catch(error => expect(error.message).toBe(errors.DUPLICATE_KEY)))

  test('should reject Error with (DUPLICATE_KEY) when findOneAndUpdate with (duplicate email)', () =>
    User.findOneAndUpdate(
      { username: 'mno' },
      { email: 'abc1@abc.com' },
      { new: true }
    )
      .then(user => expect(user).toBeUndefined())
      .catch(error => expect(error.message).toBe(errors.DUPLICATE_KEY)))
})
