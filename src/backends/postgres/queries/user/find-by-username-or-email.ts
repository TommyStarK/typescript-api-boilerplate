/* eslint-disable @typescript-eslint/quotes */
import { Query } from '@app/backends/postgres';

export const findUserByUsernameOrEmail = (username: string, emailEncrypted: string): Query => new Query(
  `SELECT "email", "username" FROM users u WHERE u."username" = $1 OR u."email" = $2 ORDER BY "email" LIMIT 1;`,
  [username, emailEncrypted],
);
