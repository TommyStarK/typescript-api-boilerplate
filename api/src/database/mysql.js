import mysql from 'mysql';
import util from 'util';

let _connection = undefined;

async function checkDatabase(db) {
  try {
    await _connection.query(`create database if not exists ${db};`);
    await _connection.query(`use ${db};`);
    await _connection.query(`create table if not exists users (
        id int primary key auto_increment,
        email varchar(255) not null,
        password varchar(255) not null,
        userID varchar(255) not null,
        username varchar(255) not null
      )
      `);
  } catch (error) {
    throw (error);
  }
}

export const database = {
  connect: async (config) => {
    try {
      if (_connection !== undefined) {
        console.log('MySQL client already connected.');
        return;
      }

      const db = config.database;
      delete config.database;
      const connection = mysql.createConnection(config);
      await connection.connect();
      _connection = connection;
      await checkDatabase(db);
    } catch (error) {
      throw (error);
    }
  },

  escape: (target) => {
    return mysql.escape(target);
  },

  getConnection: () => {
    return _connection;
  },

  query: () => {
    return util.promisify(_connection.query).bind(_connection);
  },

  quit: async () => {
    try {
      await _connection.end();
    } catch (error) {
      throw (error);
    }
  }
};