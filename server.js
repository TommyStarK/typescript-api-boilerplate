const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./routes/router.js')
const config = require('./config.js')
const database = require('./database.js')
const account = require('./account/manager.js')

const name = `[\x1b[35m${config.app.name}\x1b[0m]`
const success = '\x1b[32mOK\x1b[0m'
const failure = '\x1b[31mFAILED\x1b[0m'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Accounts management
app.post(`/${config.app.url}/register`, account.register)
app.post(`/${config.app.url}/authorize`, account.authorize)
app.delete(`/${config.app.url}/delete`, account.delete)

// Ensures that all requests starting with `/${config.app.url}/*` will be checked
// for the token
app.all(`/${config.app.url}/*`, [require('./middleware/token')])

// Mounts the router as middleware at path "/"
app.use('/', router)

database.connect()
  .then(() => {
    console.log(`${name} Connection to the database [${success}]`)
    database.init()
      .then(() => {
        app.listen(config.app.port, () => {
          console.log(`${name} Listening on port ${config.app.port} [${success}]`)
          console.log(`${name} Starting service [${success}]`)
        })
      })
      .catch(err => {
        console.log(`${name} Starting service [${failure}]`)
        console.log(err.message)
        database.close()
        process.exit(1)
      })
  })
  .catch(err => {
    if (err) {
      console.log(`${name} Connection to the database [${failure}]`)
      console.log(err.message)
      process.exit(1)
    }
  })

process.on("SIGTERM", () => {
    app.close(() => {
        process.exit(0);
    });
});
