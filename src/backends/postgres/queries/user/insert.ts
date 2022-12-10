/* eslint-disable @typescript-eslint/quotes */
import uniqid from 'uniqid';

import { Query } from '@app/backends/postgres';

export const insertUser = (username: string, emailEncrypted: string, passwordHash: string): Query => new Query(
  `INSERT INTO users ("email", "password", "userID", "username") VALUES ($1, $2, $3, $4);`,
  [emailEncrypted, passwordHash, uniqid(), username],
);
