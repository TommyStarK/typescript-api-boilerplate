import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import config from '@app/config';
import { MongoDBClient } from '@app/storage/mongodb';
import IoCMongoDBClientIdentifier from '@app/storage/mongodb/symbol';
import { MySQLClient } from '@app/storage/mysql';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import utils from '@app/utils';

@injectable()
export class UserService {
  private readonly accountDetails: string[] = [
    'email',
    'password',
    'username',
  ];

  constructor(
    @inject(IoCMongoDBClientIdentifier) private mongoClient: MongoDBClient,
    @inject(IoCMySQLClientIdentifier) private mysqlClient: MySQLClient,
  ) {}

  private checkPayloadIsValid(payload: any, emailRequired: boolean): any {
    // eslint-disable-next-line no-restricted-syntax
    for (const field of this.accountDetails) {
      if ((emailRequired || (!emailRequired && field !== 'email')) && !(field in payload)) {
        return {
          status: 422,
          success: false,
          message: `Body missing '${field}' field`,
        };
      }
    }

    return {
      status: 422,
      success: emailRequired ? utils.validateEmail(payload.email) : true,
      message: 'Invalid email',
    };
  }

  public async authenticate(payload: { username: string; password: string; }): Promise<any> {
    const res = this.checkPayloadIsValid(payload, false);
    if (!res.success) {
      return (({ status, message }) => ({ status, message }))(res);
    }

    const query = this.mysqlClient.query();
    const { username, password } = payload;
    const passwordHash = utils.hash(password);
    const results = await query(
      'select userID, username from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    if (!results.length) {
      return { status: 401, message: 'Wrong credentials' };
    }

    const user: any = results[0];
    const tokenPayload = {
      username: user.username,
      userID: user.userID,
    };

    const newToken = jwt.sign(
      tokenPayload, config.app.secret, { expiresIn: config.app.expiresIn },
    );

    return { status: 200, token: newToken };
  }

  public async create(payload: { username: string; email: string; password: string; }): Promise<any> {
    const res = this.checkPayloadIsValid(payload, true);
    if (!res.success) {
      return (({ status, message }) => ({ status, message }))(res);
    }

    const query = this.mysqlClient.query();
    const { username, email, password } = payload;
    const emailEncrypted = utils.encrypt(email);
    const passwordHash = utils.hash(password);
    const results = await query(
      'select email, username from users where username = ? or email = ? order by email limit 1',
      [username, emailEncrypted],
    );

    if (results.length > 0) {
      let target = '';
      let content = '';

      const user: any = results[0];
      if (user.username === username) {
        target = 'Username';
        content = user.username;
      } else {
        target = 'Email';
        content = email;
      }

      return {
        status: 409,
        message: `Conflict: ${target} [${content}] already used`,
      };
    }

    await query(
      'insert into `users`(`email`, `password`, `userID`, `username`) values(?,?,?,?)',
      [emailEncrypted, passwordHash, uniqid(), username],
    );

    return { status: 201, message: 'Account has been registered' };
  }

  public async delete(payload: { username: string; password: string; }): Promise<any> {
    const res = this.checkPayloadIsValid(payload, false);
    if (!res.success) {
      return (({ status, message }) => ({ status, message }))(res);
    }

    const connection = await this.mysqlClient.getConnection();
    const { username, password } = payload;
    const passwordHash = utils.hash(password);
    const results = await connection.query(
      'select userID from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    if (!results.length) {
      return { status: 401, message: 'Wrong credentials' };
    }

    await connection.query(
      'delete from users where username = ? and password = ? order by username limit 1',
      [username, passwordHash],
    );

    connection.release();
    const u: any = results[0];
    const db = this.mongoClient.getDatabase();
    const user = await db.collection('users').findOneAndDelete({
      userID: u.userID,
    });

    const clean = async (element) => {
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
