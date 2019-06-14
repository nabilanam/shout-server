const config = require('config')
const db = require('./database')
const app = require('./app')
const port = config.get('port')

db.connect()

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${port}`)
})

server.setTimeout(config.get('request_timeout'))
