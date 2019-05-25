const User = require('../../models/User')
const controller = require('./index')

describe('User controller -> create', () => {
  const username = 'abcwtw'
  const email = 'abtwc@xyz.com'
  const password = 'lmnopqrs'

  test('should return token when successful', () => {
    jest
      .spyOn(User.prototype, 'save')
      .mockImplementation(() => Promise.resolve({ id: 123 }))

    return controller.create(username, email, password).then(response => {
      expect(response.status).toBe(200)
      expect(response.data.split('.').length).toBe(3)
    })
  })

  test('should return 400 status when username or email exists', () => {
    jest
      .spyOn(User.prototype, 'save')
      .mockImplementation(() =>
        Promise.reject(new Error(User.status.DUPLICATE_KEY))
      )

    return controller
      .create(username, email, password)
      .catch(err => expect(err.status).toBe(400))
  })

  test('should return 500 status for unknown error', () => {
    jest
      .spyOn(User.prototype, 'save')
      .mockImplementation(() => Promise.reject(new Error('unknown')))

    return controller
      .create(username, email, password)
      .catch(err => expect(err.status).toBe(500))
  })
})
