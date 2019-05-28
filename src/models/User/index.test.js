const config = require('config')
const md5 = require('md5')
const { Error } = require('mongoose')

const memoryDB = require('../../database/memory')
const User = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User model', () => {
  test('should add md5 hash to auth_key when {username, email, password}', () =>
    new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user => expect(user.auth_key).toBe(md5(user.id))))

  test('should reject Error with (User.status.DUPLICATE_KEY) when saving with {duplicate username, email, password}', () =>
    new User({
      username: 'abc',
      email: 'xyz@xyz.com',
      password: 'abcabcabc'
    })
      .save()
      .catch(error => expect(error.message).toBe(User.status.DUPLICATE_KEY)))

  test('should reject Error with (User.status.DUPLICATE_KEY) when saving with {username, duplicate email, password}', () =>
    new User({
      username: 'xyz',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .catch(error => expect(error.message).toBe(User.status.DUPLICATE_KEY)))

  test('should reject Error with (User.status.DUPLICATE_KEY) when updating with findOneAndUpdate {duplicate username}', () =>
    new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user =>
        User.findOneAndUpdate(
          { username: 'abc' },
          { username: user.username }
        ).catch(error => expect(error.message).toBe(User.status.DUPLICATE_KEY))
      ))

  test('should reject Error with (User.status.DUPLICATE_KEY) when updating with findOneAndUpdate {duplicate email}', () =>
    new User({
      username: 'xyz',
      email: 'xyz@xyz.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user =>
        User.findOneAndUpdate({ username: 'abc' }, { email: user.email }).catch(
          error => expect(error.message).toBe(User.status.DUPLICATE_KEY)
        )
      ))

  test('should reject mongoose.Error when {username, password}', () =>
    new User({ username: 'pqr', password: 'pqr' })
      .save()
      .catch(error => expect(error).toBeInstanceOf(Error)))

  test('should reject mongoose.Error when {email, password}', () =>
    new User({ email: 'pqr', password: 'zyxwvu' })
      .save()
      .catch(error => expect(error).toBeInstanceOf(Error)))

  test('should reject mongoose.Error when {username, email}', () =>
    new User({ username: 'pqr', email: 'pqr@pqr.com' })
      .save()
      .catch(error => expect(error).toBeInstanceOf(Error)))

  test('should reject mongoose.Error when {}', () =>
    new User({}).save().catch(error => expect(error).toBeInstanceOf(Error)))
})
