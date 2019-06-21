const jsonwebtoken = require('jsonwebtoken')
const config = require('config')
const client = require('../../database/redis')
const memoryDB = require('../../database/memory')
const { /*verify,*/ logout } = require('./index')
const User = require('../../models/User')
const ErrorResponse = require('../../response/ErrorResponse')
const jwt_secret = config.get('jwt_secret')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(async done => {
  await memoryDB.stop()
  await client.end(false)
  done()
})

// TODO: FIX
// describe('auth middleware -> verify', () => {
//   const next = jest.fn()
//   const json = jest.fn()
//   const status = jest.fn().mockReturnValue({ json })
//   const res = { status }
//   let req = { header: null }

//   beforeAll(() =>
//     new User({ username: 'abc', email: 'abc@abc.com', password: 'xyz' })
//       .save()
//       .then(user => {
//         req.header = jest.fn().mockImplementation(key => {
//           if (key === 'x-auth-token')
//             return jsonwebtoken.sign({ id: user.id }, jwt_secret, {
//               expiresIn: '1m'
//             })
//         })
//       })
//   )

//   afterEach(() => {
//     next.mockClear()
//     json.mockClear()
//     status.mockClear()
//   })

//   test('should call next when user found by header(x-auth-token)', () =>
//     verify(req, res, next).then(() => {
//       expect(next).toBeCalledTimes(1)
//       expect(req.user).toBeDefined()
//       expect(req.user).toBeInstanceOf(User)
//     }))

//   test('should set response to ErrorResponse with (401, "Authorization required") when header(x-auth-token:"") ', () => {
//     req.header = jest.fn().mockImplementation(key => {
//       if (key === 'x-auth-token') return ''
//     })
//     verify(req, res, next).then(() => {
//       const response = json.mock.calls[0][0]
//       expect(next).toBeCalledTimes(0)
//       expect(status).toBeCalledTimes(1)
//       expect(json).toBeCalledTimes(1)
//       expect(response).toBeInstanceOf(ErrorResponse)
//       expect(response.status).toBe(401)
//       expect(response.error).toBe('Authorization required')
//     })
//   })

//   test('should set response to ErrorResponse with (401, "Authorization required") when header(x-auth-token: invalid)', () => {
//     req.header = jest.fn().mockImplementation(key => {
//       if (key === 'x-auth-token') return 'xxx'
//     })
//     verify(req, res, next).then(() => {
//       const response = json.mock.calls[0][0]
//       expect(next).toBeCalledTimes(0)
//       expect(status).toBeCalledTimes(1)
//       expect(json).toBeCalledTimes(1)
//       expect(response).toBeInstanceOf(ErrorResponse)
//       expect(response.status).toBe(401)
//       expect(response.error).toBe('Authorization required')
//     })
//   })
// })

describe('auth middleware -> logout', () => {
  const next = jest.fn()
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const res = { status }
  let req = { header: null }

  beforeAll(() =>
    new User({ username: 'mno', email: 'mno@mno.com', password: 'xyz' })
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
    logout(req, res, next).then(() => {
      expect(next).toBeCalledTimes(1)
      expect(req.seconds).toBeDefined()
      expect(req.token).toBeDefined()
    }))

  test('should set response to ErrorResponse with (401, "Authorization required") when header(x-auth-token:"") ', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return ''
    })
    logout(req, res, next).then(() => {
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
