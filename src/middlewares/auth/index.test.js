const jsonwebtoken = require('jsonwebtoken')
const config = require('config')
const client = require('../../database/redis')
const memoryDB = require('../../database/memory')
const { verify, logout, extend } = require('./index')
const User = require('../../models/User')
const ErrorResponse = require('../../response/ErrorResponse')
const jwt_secret = config.get('jwt_secret')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(async done => {
  await memoryDB.stop()
  await client.end(false)
  done()
})

describe('auth middleware -> verify', () => {
  const next = jest.fn()
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const res = { status }
  let req = { header: null }
  let authenticated_user = null
  let unauthenticated_user = null
  let token = null

  beforeAll(async done => {
    authenticated_user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: 'xyz',
      is_authenticated: true
    }).save()

    unauthenticated_user = await new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: 'xyz'
    }).save()

    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return token
    })
    done()
  })

  afterAll(() => User.deleteMany({}))

  afterEach(() => {
    next.mockClear()
    json.mockClear()
    status.mockClear()
  })

  test('should call next when authenticated user found by header(x-auth-token)', () => {
    token = jsonwebtoken.sign({ id: authenticated_user.id }, jwt_secret, {
      expiresIn: '1m'
    })
    return verify(req, res, next)
      .then(() => {
        expect(next).toBeCalledTimes(1)
        expect(req.user).toBeDefined()
        expect(req.user).toBeInstanceOf(User)
      })
      .catch(error => expect(error).toBeUndefined())
  })

  test('should return response with (401, "Authorization required") when blacklisted token', () => {
    token = jsonwebtoken.sign({ id: authenticated_user.id }, jwt_secret, {
      expiresIn: '1m'
    })
    client.set(token, true)

    return verify(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })

  test('should return response with (401, "Authorization required") when unauthenticated user', () => {
    token = jsonwebtoken.sign({ id: unauthenticated_user.id }, jwt_secret, {
      expiresIn: '1m'
    })
    return verify(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })

  test('should return response with (401, "Authorization required") when header(x-auth-token:"") ', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return ''
    })
    return verify(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })

  test('should return response with (401, "Authorization required") when header(x-auth-token: invalid)', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return 'xxx'
    })
    return verify(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })
})

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
    logout(req, res, next)
      .then(() => {
        expect(next).toBeCalledTimes(1)
        expect(req.seconds).toBeDefined()
        expect(req.token).toBeDefined()
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return response with (401, "Authorization required") when header(x-auth-token:"") ', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return ''
    })
    return logout(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })
})

describe('auth middleware -> extend', () => {
  const next = jest.fn()
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const res = { status }
  let req = { header: null }
  let user = null

  beforeAll(async done => {
    user = await new User({
      username: 'xyz',
      email: 'xyz@xyz.com',
      password: 'xyz'
    }).save()

    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token')
        return jsonwebtoken.sign({ id: user.id }, jwt_secret, {
          expiresIn: '1m'
        })
    })

    done()
  })

  afterEach(() => {
    next.mockClear()
    json.mockClear()
    status.mockClear()
  })

  test('should call next when user found by header(x-auth-token)', () =>
    extend(req, res, next)
      .then(() => {
        expect(next).toBeCalledTimes(1)
        expect(req.user_id).toBe(user.id)
      })
      .catch(error => expect(error).toBeUndefined()))

  test('should return response with (401, "Authorization required") when header(x-auth-token:"") ', () => {
    req.header = jest.fn().mockImplementation(key => {
      if (key === 'x-auth-token') return ''
    })
    return extend(req, res, next)
      .then(() => {
        const response = json.mock.calls[0][0]
        expect(next).toBeCalledTimes(0)
        expect(status).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(1)
        expect(response).toBeInstanceOf(ErrorResponse)
        expect(response.status).toBe(401)
        expect(response.error).toBe('Authorization required')
      })
      .catch(error => expect(error).toBeUndefined())
  })
})
