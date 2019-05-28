const mail = require('./index')
const nodemailer = require('nodemailer')

describe('mail -> send_mail ', () => {
  const sendMail_mock = jest.fn().mockResolvedValue()
  const createTransport_mock = jest
    .spyOn(nodemailer, 'createTransport')
    .mockImplementation(() => {
      return { sendMail: sendMail_mock }
    })

  afterEach(() => {
    sendMail_mock.mockClear()
    createTransport_mock.mockClear()
  })

  test('should call nodemailer->createTransport one time', () =>
    mail
      .send_mail()
      .then(() => expect(nodemailer.createTransport).toBeCalledTimes(1)))

  test('should call nodemailer->sendMail one time', () =>
    mail.send_mail().then(() => expect(sendMail_mock).toBeCalledTimes(1)))
})
