import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import config from '../../config';
import mysql from '../../storage/mysql';
import mongo from '../../storage/mongodb';
import utils from '../../utils';

const accountDetails = [
  'email',
  'password',
  'username',
];

const checkPayloadIsValid = (payload, emailRequired) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const field of accountDetails) {
    if ((emailRequired || (!emailRequired && field !== 'email')) && !(field in payload)) {
      return {
        status: 412,
        success: false,
        message: `Body missing '${field}' field`,
      };
    }
  }

  return {
    status: 412,
    success: emailRequired ? utils.validateEmail(payload.email) : true,
    message: 'Invalid email',
  };
};

const userController = {
  authenticate: async (payload) => {
    try {
      const res = checkPayloadIsValid(payload, false);
      if (!res.success) {
        return (({ status, message }) => ({ status, message }))(res);
      }

      const query = mysql.query();
      const { username, password } = payload;
      const passwordHash = utils.hash(password);
      const results = await query(
        'select userID, username from users where username = ? and password = ? order by username limit 1',
        [username, passwordHash],
      );

      if (!results.length) {
        return { status: 401, message: 'Wrong credentials' };
      }

      const tokenPayload = {
        username: results[0].username,
        userID: results[0].userID,
      };

      const newToken = jwt.sign(
        tokenPayload, config.app.secret, { expiresIn: config.app.expiresIn },
      );

      return { status: 200, token: newToken };
    } catch (error) {
      throw (error);
    }
  },

  create: async (payload) => {
    try {
      const res = checkPayloadIsValid(payload, true);
      if (!res.success) {
        return (({ status, message }) => ({ status, message }))(res);
      }

      const query = mysql.query();
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

        if (results[0].username === username) {
          target = 'Username';
          content = results[0].username;
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
    } catch (error) {
      throw (error);
    }
  },

  delete: async (payload) => {
    try {
      const res = checkPayloadIsValid(payload, false);
      if (!res.success) {
        return (({ status, message }) => ({ status, message }))(res);
      }

      const query = mysql.query();
      const { username, password } = payload;
      const passwordHash = utils.hash(password);
      const results = await query(
        'select userID from users where username = ? and password = ? order by username limit 1',
        [username, passwordHash],
      );

      if (!results.length) {
        return { status: 401, message: 'Wrong credentials' };
      }

      await query(
        'delete from users where username = ? and password = ? order by username limit 1',
        [username, passwordHash],
      );

      const db = mongo.getDatabase();
      const user = await db.collection('users').findOneAndDelete({
        userID: results[0].userID,
      });

      const clean = async (element) => {
        const target = await db.collection('fs.files').findOneAndDelete({
          _id: element.fileid,
        });

        await db.collection('fs.chunks').deleteMany({
          // eslint-disable-next-line no-underscore-dangle
          files_id: target.value._id,
        });
      };

      if (user.value) {
        await Promise.all(user.value.pictures.map(elem => clean(elem)));
      }

      return { status: 200, message: 'Account has been unregistered' };
    } catch (error) {
      throw (error);
    }
  },
};

export { userController as default };
