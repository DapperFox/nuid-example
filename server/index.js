const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const { register, login, challenge } = require('./controllers/index.js')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/challenge', challenge)
app.post('/login', login)
app.post('/register', register)

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`)
})
