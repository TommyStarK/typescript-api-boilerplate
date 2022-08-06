import crypto from 'crypto';

import { AppConfig } from '@app/config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const password = crypto.createHash('sha256').update(`${AppConfig.app.secret}`).digest('base64').substring(0, 32);

export const decrypt = (target: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, password, iv);
  let dec = decipher.update(target, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

export const encrypt = (target: string): string => {
  const cipher = crypto.createCipheriv(algorithm, password, iv);
  let crypted = cipher.update(target, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

export const hash = (target: crypto.BinaryLike): string => {
  const h = crypto.createHash('sha256');
  h.update(target);
  return h.digest('hex');
};
