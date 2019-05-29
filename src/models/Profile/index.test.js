const config = require('config')

const memoryDB = require('../../database/memory')
const Profile = require('./index')
const User = require('../User')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('Profile model', () => {
  let user = null
  beforeAll(() =>
    new User({ username: 'abc', email: 'abc@abc.com', password: 'abc' })
      .save()
      .then(u => (user = u))
  )

  test('should resolve when {user}', () =>
    new Profile({ user }).save().then(profile => {
      expect(profile).toBeDefined()
      expect(profile.user).toBeDefined()
    }))

  test('should reject Error with ("User doesn\'t exist") when {undefined user}', () =>
    new Profile().save().catch(error => {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe("User doesn't exist")
    }))

  test('should reject MongoError when {duplicate user}', () =>
    new Profile({ user }).save().catch(error => expect(error).toBeDefined()))
})
