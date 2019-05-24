const request = require('supertest')
const app = require('./index')

describe('GET path /', () => {
  test('should return 200 status', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
  })

  test('should return json body', async () => {
    const res = await request(app).get('/')
    expect(res.body).toEqual({ msg: 'welcome' })
  })
})
