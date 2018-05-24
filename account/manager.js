const jwt = require('jsonwebtoken')
const utils = require('../utils.js')
const config = require('../config.js')
const database = require('../database.js')

const account = {

  async register (request, response, next) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined ||
        request.body.email === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/email/password field(s)'
      })
    }

    if (utils.validateEmail(request.body.email) === false) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Invalid email'
      })
    }

    try {
      const doc = await db.collection('users').findOne(
        {
          $or: [
            {username: request.body.username},
            {email: utils.hash(request.body.email)}
          ]
        })

      if (doc) {
        const t =
            doc.username === request.body.username ? 'Username' : 'Email'
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${t} already used`
        })
      }

      await db.collection('users').insertOne(
        {
          username: request.body.username,
          password: utils.hash(request.body.password),
          email: utils.hash(request.body.email)
        })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Account registered successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  async authorize (request, response, next) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)'
      })
    }

    try {
      const doc = await db.collection('users').findOne(
        {
          username: request.body.username,
          password: utils.hash(request.body.password)
        })

      if (doc) {
        const payload = {username: doc.username, userId: doc._id}
        const newToken = await jwt.sign(payload, config.app.auth.secret, {expiresIn: config.app.auth.expiresIn})
        return response.status(200).json({
          status: 200,
          success: true,
          token: newToken
        })
      }

      return response.status(401).json({
        status: 401,
        success: false,
        message: 'Wrong credentials'
      })
    } catch (err) {
      next(err)
    }
  },

  async delete (request, response, next) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)'
      })
    }

    try {
      const doc = await db.collection('users').findOneAndDelete(
        {
          username: request.body.username,
          password: utils.hash(request.body.password)
        })

      if (doc && doc.value !== null) {
        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Account deleted successfully'
        })
      }

      return response.status(401).json({
        status: 401,
        success: false,
        message: 'Wrong credentials'
      })
    } catch (err) {
      next(err)
    }
  }

}

module.exports = account
