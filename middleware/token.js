const mongo = require('mongodb')
const jwt = require('jsonwebtoken')
const config = require('../config.js')
const database = require('../database.js')

module.exports = (request, response, next) => {
  const token = (request.body && request.body.access_token) ||
      (request.query && request.query.access_token) ||
      request.headers['x-access-token'] || request.headers.authorization

  if (token) {
    const db = database.get()

    jwt.verify(token, config.app.auth.secret, (err, decoded) => {
      if (err) {
        return response.status(401).json({
          status: 401,
          success: false,
          message: 'Invalid token'
        })
      }

      request.decoded = decoded
      try {
        db.collection('users')
          .findOne({ _id: new mongo.ObjectID(request.decoded.userId) })
          .then(doc => {
            if (doc === null) {
              return response.status(403).json({
                status: 403,
                success: false,
                message: 'Forbidden'
              })
            }

            next()
          })
      } catch (err) {
        next(err)
      }
    })
  } else {
    return response.status(401).json({
      status: 401,
      success: false,
      message: 'No token provided'
    })
  }
}
