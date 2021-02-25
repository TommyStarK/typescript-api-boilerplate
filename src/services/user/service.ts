import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import { AppConfig } from '@app/config';
import { MongoDBClient } from '@app/storage/mongodb';
import { MySQLClient } from '@app/storage/mysql';
import TYPES from '@app/IoC/types';
import utils from '@app/utils';

import {
  AuthPayload,
  RegistrationPayload,
} from '@app/services/user/model';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.MongoDBClient) private mongoClient: MongoDBClient,
    @inject(TYPES.MySQLClient) private mysqlClient: MySQLClient,
  ) {}

  public async authenticate(payload: AuthPayload): Promise<{ status: number, message?: string, token?: string }> {
    const connection = await this.mysqlClient.getConnection();
    const { username, password } = payload;
    const passwordHash = utils.hash(password);

    const [rows] = await connection.execute(
      'select userID, username from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    connection.release();
    const users = this.mysqlClient.processRows(rows);

    if (!users.length) {
      return { status: 401, message: 'Wrong credentials' };
    }

    const user = users[0];
    const tokenPayload = {
      username: user.username,
      userID: user.userID,
    };

    const newToken = jwt.sign(
      tokenPayload, AppConfig.app.secret, { expiresIn: AppConfig.app.expiresIn },
    );

    return { status: 200, token: newToken };
  }

  public async create(payload: RegistrationPayload): Promise<{ status: number, message: string }> {
    const connection = await this.mysqlClient.getConnection();
    const { username, email, password } = payload;
    const emailEncrypted = utils.encrypt(email);
    const passwordHash = utils.hash(password);

    const [rows] = await connection.execute(
      'select email, username from users where username = ? or email = ? order by email limit 1',
      [username, emailEncrypted],
    );

    const users = this.mysqlClient.processRows(rows);

    if (users.length > 0) {
      const user: any = users[0];
      connection.release();

      return {
        status: 409,
        message: `Conflict: ${
          user.username === username ? 'Username' : 'Email'
        } [${user.username === username ? user.username : email}] already used`,
      };
    }

    await connection.execute(
      'insert into `users`(`email`, `password`, `userID`, `username`) values(?,?,?,?)',
      [emailEncrypted, passwordHash, uniqid(), username],
    );

    connection.release();
    return { status: 201, message: 'Account has been registered' };
  }

  public async delete(payload: AuthPayload): Promise<{ status: number, message: string }> {
    const connection = await this.mysqlClient.getConnection();
    const { username, password } = payload;
    const passwordHash = utils.hash(password);

    const [rows] = await connection.execute(
      'select userID from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    const users = this.mysqlClient.processRows(rows);

    if (!users.length) {
      connection.release();
      return { status: 401, message: 'Wrong credentials' };
    }

    await connection.execute(
      'delete from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    connection.release();
    const u = users[0];
    const db = this.mongoClient.getDatabase();
    const user = await db.collection('users').findOneAndDelete({
      userID: u.userID,
    });

    const clean = async (element: any) => {
      const target = await db.collection('fs.files').findOneAndDelete({
        _id: element.fileid,
      });

      await db.collection('fs.chunks').deleteMany({
        files_id: target.value._id,
      });
    };

    if (user.value) {
      await Promise.all(user.value.pictures.map((elem: unknown) => clean(elem)));
    }

    return { status: 200, message: 'Account has been unregistered' };
  }
}
