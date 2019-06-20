const express = require('express')
const app = express()

app.use(express.json())

// routes
app.use('/auth', require('../routes/auth'))
app.use('/api/users', require('../routes/users'))
app.use('/api/profiles', require('../routes/profiles'))
app.use('/api/feed', require('../routes/feed'))

module.exports = app
