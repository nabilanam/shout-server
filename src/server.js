const db = require('./db')
const config = require('config')
const app = require('./app')

db.connect()

const PORT = config.get('PORT')
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})
