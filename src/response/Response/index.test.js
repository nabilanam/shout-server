const Response = require('./index')

describe('Response', () => {
  test('should initialize properly', () => {
    const status = 200
    const data = 'lorem ipsum'

    const response = new Response(status, data)

    expect(response).toEqual({ status, data })
  })
})
