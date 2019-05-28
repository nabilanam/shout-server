const config = require('config')
const md5 = require('md5')

const memoryDB = require('../../database/memory')
const User = require('./index')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('User model', () => {
  test('should add md5 to auth_key before save', () =>
    new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user => expect(user.auth_key).toBe(md5(user.id))))

  test('should return DUPLICATE_KEY on save if username or email already exists', () =>
    new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'abcabcabc'
    })
      .save()
      .catch(error => expect(error.message).toBe(User.status.DUPLICATE_KEY)))

  test('should return DUPLICATE_KEY on findOneAndUpdate if username or email already exists', () =>
    new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: 'abcabcabc'
    })
      .save()
      .then(user =>
        User.findOneAndUpdate({ username: 'abc' }, { email: user.email }).catch(
          error => expect(error.message).toBe(User.status.DUPLICATE_KEY)
        )
      ))
})
