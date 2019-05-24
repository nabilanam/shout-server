const ValidatorResponse = require('./index')

describe('ValidatorResponse', () => {
  test('should initialize properly', () => {
    const status = 200
    const errors = {
      array: () => [
        {
          msg: 'wrong password',
          param: 'password'
        }
      ]
    }

    const response = new ValidatorResponse(status, errors)

    expect(response).toEqual({
      status,
      error: 'wrong password',
      param: 'password'
    })
  })
})
