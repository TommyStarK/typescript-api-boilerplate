import crypto from 'crypto';
import fs from 'fs';
import { URL } from 'url';

import { AppConfig } from '@app/config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const password = crypto.createHash('sha256').update(`${AppConfig.app.secret}`).digest('base64').substring(0, 32);

const utils = {
  decrypt: (target: string): string => {
    const decipher = crypto.createDecipheriv(algorithm, password, iv);
    let dec = decipher.update(target, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },

  encodeBase64: async (filePath: string): Promise<string> => {
    const data = await utils.readFileAsync(filePath);
    return Buffer.from(data).toString('base64');
  },

  encrypt: (target: string): string => {
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(target, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  hash: (target: crypto.BinaryLike): string => {
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
};

export default utils;
