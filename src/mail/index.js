const nodemailer = require('nodemailer')
const { host, port, username, password, isSecure } = require('config').get(
  'mail'
)

const send_mail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: isSecure,
    auth: {
      user: username,
      pass: password
    }
  })

  return transporter.sendMail({
    from: `"Shout Team" <${username}>`,
    to,
    subject,
    text
  })
}

module.exports = {
  send_mail
}
