const express = require('express')
const router = new express.Router()
const config = require('../config.js')

//
// Routing
//

// Frist path handled
router.get(`/${config.app.url}`, (request, response, next) => {
  response.status(200).json({
    status: 200,
    success: true,
    message: `Welcome to the ${config.app.name}`
  })
})

// 
// 
// 
// 
// IMPLEMENT YOUR ROUTING HERE
// 
// 
// 
// 
// 


// 
// test middleware
// 
router.get(`/${config.app.url}/hello`, (request, response, next) => {
  response.status(200).json({
    status: 200,
    success: true,
    message: `Hello ${request.decoded.username}`
  })
})

// If no route is matched a '404 Not Found' error is returned.
router.use(require('../middleware/error.js').notFound)

// Error middleware to catch unexpected errors
router.use(require('../middleware/error.js').errorHandler)

module.exports = router
