const ErrorResponse = require('./index')

describe('ErrorResponse', () => {
  test('should initialize properly', () => {
    const status = 200
    const error = 'lorem ipsum'

    const response = new ErrorResponse(status, error)

    expect(response).toEqual({ status, error })
  })
})
