const ErrorResponse = require('../ErrorResponse')

class ValidatorResponse extends ErrorResponse {
  constructor(status, validation_errors) {
    const { msg, param } = validation_errors.array()[0]
    super(status, msg)
    this.param = param
  }
}

module.exports = ValidatorResponse
