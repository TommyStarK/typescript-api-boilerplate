import fs from 'fs';
import crypto from 'crypto';

import config from '../config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const password = crypto.createHash('sha256').update(String(config.app.secret)).digest('base64').substr(0, 32);
// eslint-disable-next-line no-useless-escape
const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const utils = {
  checkStringLengthInBytes: (target) => Buffer.byteLength(target, 'utf8') === 24,

  encodeBase64: async (filePath) => {
    const data = await utils.readFileAsync(filePath);
    return Buffer.from(data).toString('base64');
  },

  encrypt: (target) => {
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(target, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt: (target) => {
    const decipher = crypto.createDecipheriv(algorithm, password, iv);
    let dec = decipher.update(target, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },

  hash: (target) => {
    const hash = crypto.createHash('sha256');
    hash.update(target);
    return hash.digest('hex');
  },

  readdirAsync: (filePath) => new Promise((resolve, reject) => {
    fs.readdir(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  readFileAsync: (filePath) => new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  unlinkAsync: (filePath) => new Promise((resolve, reject) => {
    fs.unlink(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  writeFileAsync: (filePath, content) => new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  validateEmail: (email) => re.test(email),
};

export default utils;
