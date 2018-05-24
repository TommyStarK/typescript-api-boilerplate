
module.exports = {
  hash (target) {
    const hash = require('crypto').createHash('sha256')
    hash.update(target)
    return hash.digest('hex')
  },

  validateEmail (email) {
    let re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }
}
