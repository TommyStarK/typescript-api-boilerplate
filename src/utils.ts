import crypto from 'crypto';
import fs from 'fs';
import { URL } from 'url';

import config from '@app/config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const password = crypto.createHash('sha256').update(String(config.app.secret)).digest('base64').substr(0, 32);
// eslint-disable-next-line no-useless-escape
const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const utils = {
  checkStringLengthInBytes: (target: string) => Buffer.byteLength(target, 'utf8') === 24,

  encodeBase64: async (filePath: any) => {
    const data = await utils.readFileAsync(filePath);
    return Buffer.from(data).toString('base64');
  },

  encrypt: (target: string) => {
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(target, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt: (target: string) => {
    const decipher = crypto.createDecipheriv(algorithm, password, iv);
    let dec = decipher.update(target, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },

  hash: (target: crypto.BinaryLike) => {
    const hash = crypto.createHash('sha256');
    hash.update(target);
    return hash.digest('hex');
  },

  readdirAsync: (filePath: fs.PathLike) => new Promise<string[]>((resolve, reject) => {
    fs.readdir(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  readFileAsync: (filePath: string | number | Buffer | URL) => new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }),

  unlinkAsync: (filePath: fs.PathLike) => new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }),

  writeFileAsync: (filePath: string | number | Buffer | URL, content: any) => new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, content, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }),

  validateEmail: (email: string) => re.test(email),
};

export default utils;
