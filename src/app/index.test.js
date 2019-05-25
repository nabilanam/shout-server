const request = require('supertest')
const app = require('./index')

describe('GET path /', () => {
  let res = null
  beforeAll(async () => {
    res = await request(app).get('/')
  })

  test('should return 200 status', () => {
    expect(res.statusCode).toBe(200)
  })

  test('should return json body', () => {
    expect(res.body).toEqual({ msg: 'welcome' })
  })
})
