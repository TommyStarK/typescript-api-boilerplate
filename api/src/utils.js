import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

import {config} from './config';

export const utils = {
  encodeBase64: async (file) => {
    try {
      const data = await utils.readFileAsync(file);
      return Buffer.from(data).toString('base64');
    } catch (error) {
      throw (error);
    }
  },

  hash: (target) => {
    const hash = require('crypto').createHash('sha256');
    hash.update(target);
    return hash.digest('hex');
  },

  readdirAsync: (path) => {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  readFileAsync: (file) => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  removeContentDirectory: async (target) => {
    try {
      const files = await utils.readdirAsync(target);
      for (let file of files) {
        const filePath = path.join(target, file);
        const stat = await utils.statAsync(filePath);
        if (stat.isFile(filePath)) {
          await utils.unlinkAsync(filePath);
        } else {
          utils.removeContentDirectory(filePath);
        }
      }
    } catch (error) {
      throw (error);
    }
  },

  statAsync: (path) => {
    return new Promise((resolve, reject) => {
      fs.stat(path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  unlinkAsync: (path) => {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  validateEmail: (email) => {
    let re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  },

  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.app.secret, (error, decode) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(decode);
      });
    });
  },

  writeFileAsync: (file, content) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, content, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
};