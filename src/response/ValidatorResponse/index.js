const ErrorResponse = require('../ErrorResponse')

class ValidatorResponse extends ErrorResponse {
  constructor(status, validation_error) {
    let msg, param

    if (typeof validation_error.array === 'function') {
      const error = validation_error.array()[0]
      msg = error.msg
      param = error.param
    } else {
      msg = validation_error.msg
      param = validation_error.param
    }

    super(status, msg)
    this.param = param
  }
}

module.exports = ValidatorResponse
