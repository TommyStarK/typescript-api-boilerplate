/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
import { Query } from '@app/backends/postgres';

export const findUserByUsernameAndPassword = (username: string, passwordHash: string): Query => new Query(
  `SELECT "userID", "username" FROM users u WHERE u."username" = $1 AND u."password" = $2 ORDER BY "username" LIMIT 1;`,
  [username, passwordHash],
);
