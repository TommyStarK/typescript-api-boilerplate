/* eslint-disable @typescript-eslint/quotes */
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import { MongoDBClient } from '@app/backends/mongo';
import { PostgreSQLClient, Query } from '@app/backends/postgres';
import { AppConfig } from '@app/config';
import TYPES from '@app/inversion-of-control/types';
import logger from '@app/logger';
import { encrypt, hash } from '@app/utils/crypto';
import { ConflictError, UnauthorizedError } from '@app/utils/errors';

import { AuthPayload, RegistrationPayload } from './model';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.MongoDBClient) private mongoClient: MongoDBClient,
    @inject(TYPES.PostgreSQLClient) private postgreClient: PostgreSQLClient,
  ) {}

  public async authenticate(payload: AuthPayload): Promise<{ status: number, message?: string, token?: string }> {
    const { username, password } = payload;
    const passwordHash = hash(password);

    const findUserQuery = new Query(
      // eslint-disable-next-line max-len
      `SELECT "userID", "username" FROM users u WHERE u."username" = $1 AND u."password" = $2 ORDER BY "username" LIMIT 1;`,
      [username, passwordHash],
    );

    logger.debug({ findUserQuery });

    const [user] = await this.postgreClient.query<{ userID: string; username: string }>(findUserQuery);

    if (!user) {
      throw new UnauthorizedError('wrong credentials');
    }

    const tokenPayload = {
      username: user.username,
      userID: user.userID,
    };

    const newToken = jwt.sign(
      tokenPayload, AppConfig.app.secret,
      {
        expiresIn: AppConfig.app.expiresIn,
      },
    );

    return { status: 200, token: newToken };
  }

  public async create(payload: RegistrationPayload): Promise<{ status: number, message: string }> {
    const { username, email, password } = payload;
    const emailEncrypted = encrypt(email);
    const passwordHash = hash(password);

    const findUserByEmailQuery = new Query(
      `SELECT "email", "username" FROM users u WHERE u."username" = $1 OR u."email" = $2 ORDER BY "email" LIMIT 1;`,
      [username, emailEncrypted],
    );

    logger.debug({ findUserByEmailQuery });

    const [user] = await this.postgreClient.query<{ email: string; username: string }>(findUserByEmailQuery);

    if (user) {
      throw new ConflictError(`Conflict: ${
        user.username === username ? 'Username' : 'Email'
      } [${user.username === username ? user.username : email}] already used`);
    }

    const insertUserQuery = new Query(
      `INSERT INTO users ("email", "password", "userID", "username") VALUES ($1, $2, $3, $4);`,
      [emailEncrypted, passwordHash, uniqid(), username],
    );

    await this.postgreClient.runAtomicQueries([insertUserQuery]);

    return { status: 201, message: 'Account has been registered' };
  }

  public async delete(payload: AuthPayload): Promise<{ status: number, message: string }> {
    const { username, password } = payload;
    const passwordHash = hash(password);

    const findUserQuery = new Query(
      `SELECT "userID" from users u WHERE u."username" = $1 AND u."password" = $2 ORDER BY "username" LIMIT 1;`,
      [username, passwordHash],
    );

    logger.debug({ findUserQuery });

    const [u] = await this.postgreClient.query<{ userID: string }>(findUserQuery);

    if (!u) {
      throw new UnauthorizedError('wrong credentials');
    }

    const deleteUserQuery = new Query(
      `DELETE FROM users u WHERE u."username" = $1 AND u."password" = $2;`,
      [username, passwordHash],
    );

    await this.postgreClient.runAtomicQueries([deleteUserQuery]);

    const { database } = this.mongoClient;

    const user = await database.collection('users').findOneAndDelete({
      userID: u.userID,
    });

    if (user.value) {
      const clean = async (element: any) => {
        const target = await database.collection('fs.files').findOneAndDelete({
          _id: element.fileid,
        });

        await database.collection('fs.chunks').deleteMany({
          files_id: target.value._id,
        });
      };

      await Promise.all(user.value.pictures.map(async (elem: unknown) => clean(elem)));
    }

    return { status: 200, message: 'Account has been unregistered' };
  }
}