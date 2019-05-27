const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.status(200).json({ msg: 'welcome' })
})

app.use(express.json())

// routes
app.use('/auth', require('../routes/auth'))
app.use('/api/users', require('../routes/users'))

module.exports = app
