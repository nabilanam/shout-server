const jsonwebtoken = require('jsonwebtoken')
const config = require('config')

const memoryDB = require('../../database/memory')
const auth = require('./index')
const User = require('../../models/User')
const ErrorResponse = require('../../response/ErrorResponse')
const jwt_secret = config.get('jwt_secret')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

describe('auth middleware', () => {
  const next = jest.fn()
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const res = { status }
  let req = { header: null }

  beforeAll(() =>
    new User({ username: 'abc', email: 'abc@abc.com', password: 'xyz' })
      .save()
      .then(user => {
        req.header = jest.fn().mockImplementation(key => {
          if (key === 'x-auth-token')
            return jsonwebtoken.sign({ id: user.id }, jwt_secret, {
              expiresIn: '1m'
            })
        })
      })
  )

  afterEach(() => {
    next.mockClear()
    json.mockClear()
    status.mockClear()
  })

  test('should call next when user found by header(x-auth-token)', () =>
    auth(req, res, next).then(() => {
      expect(next).toBeCalledTimes(1)
      expect(req.user).toBeDefined()
      expect(req.user).toBeInstanceOf(User)
    }))

  test('should set response to ErrorResponse with (401, "Authorization required") when header(x-auth-token:"") ', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return ''
    })
    auth(req, res, next).then(() => {
      const response = json.mock.calls[0][0]
      expect(next).toBeCalledTimes(0)
      expect(status).toBeCalledTimes(1)
      expect(json).toBeCalledTimes(1)
      expect(response).toBeInstanceOf(ErrorResponse)
      expect(response.status).toBe(401)
      expect(response.error).toBe('Authorization required')
    })
  })

  test('should set response to ErrorResponse with (401, "Authorization required") when header(x-auth-token: invalid)', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return 'xxx'
    })
    auth(req, res, next).then(() => {
      const response = json.mock.calls[0][0]
      expect(next).toBeCalledTimes(0)
      expect(status).toBeCalledTimes(1)
      expect(json).toBeCalledTimes(1)
      expect(response).toBeInstanceOf(ErrorResponse)
      expect(response.status).toBe(401)
      expect(response.error).toBe('Authorization required')
    })
  })
})
