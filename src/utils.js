import crypto from 'crypto';

const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
  hash: (target) => {
    const hash = crypto.createHash('sha256');
    hash.update(target);
    return hash.digest('hex');
  },

  validateEmail: email => re.test(email),
};
