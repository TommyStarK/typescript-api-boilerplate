import mysql from 'mysql';
import util from 'util';

let conn;

async function checkDatabase(db) {
  try {
    await conn.query(`create database if not exists ${db};`);
    await conn.query(`use ${db};`);
    await conn.query(`create table if not exists users (
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

export default {
  connect: async (config) => {
    try {
      if (conn !== undefined) {
        console.log('MySQL client already connected.');
        return;
      }

      const db = config.database;
      const { host, user, password } = config;
      const connection = mysql.createConnection({ host, user, password });
      await connection.connect();
      conn = connection;
      await checkDatabase(db);
    } catch (error) {
      throw (error);
    }
  },

  escape: target => mysql.escape(target),

  getConnection: () => conn,

  query: () => util.promisify(conn.query).bind(conn),

  quit: async () => {
    try {
      await conn.end();
    } catch (error) {
      throw (error);
    }
  },
};
