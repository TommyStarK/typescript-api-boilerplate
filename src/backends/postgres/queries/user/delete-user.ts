/* eslint-disable @typescript-eslint/quotes */
import { Query } from '@app/backends/postgres';

export const deleteUser = (username: string, passwordHash: string): Query => new Query(
  `DELETE FROM users u WHERE u."username" = $1 AND u."password" = $2;`,
  [username, passwordHash],
);
