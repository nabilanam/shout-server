const config = require('config')
const db = require('./database')
const app = require('./app')

db.connect()

const PORT = config.get('port')
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})
