const ValidatorResponse = require('./index')

describe('ValidatorResponse', () => {
  test('should initialize properly when (validationResult)', () => {
    const status = 200
    const validationResult = {
      array: () => [
        {
          msg: 'wrong password',
          param: 'password'
        }
      ]
    }

    const response = new ValidatorResponse(status, validationResult)

    expect(response).toEqual({
      status,
      error: 'wrong password',
      param: 'password'
    })
  })

  test('should initialize properly when (error object)', () => {
    const status = 200
    const error = {
      msg: 'wrong password',
      param: 'password'
    }

    const response = new ValidatorResponse(status, error)

    expect(response).toEqual({
      status,
      error: 'wrong password',
      param: 'password'
    })
  })
})
