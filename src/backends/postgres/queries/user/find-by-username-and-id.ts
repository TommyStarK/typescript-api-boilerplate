/* eslint-disable @typescript-eslint/quotes */
import { Query } from '@app/backends/postgres';

export const findUserByUsernameAndUserID = (userID: string, username: string): Query => new Query(
  `SELECT 1 FROM users u WHERE u."userID" = $1 AND u."username" = $2 ORDER BY "username" LIMIT 1;`,
  [userID, username],
);
