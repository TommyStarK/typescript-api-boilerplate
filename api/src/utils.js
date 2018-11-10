import fs from 'fs';
import path from 'path';

export const utils = {
  hash: (target) => {
    const hash = require('crypto').createHash('sha256');
    hash.update(target);
    return hash.digest('hex');
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
    } catch (err) {
      throw(err);
    }
  },

  encodeBase64: async (file) => {
    try {
      const data = await utils.readFileAsync(file);
      return Buffer.from(data).toString('base64');
    } catch (err) {
      throw(err);
    }
  }
};