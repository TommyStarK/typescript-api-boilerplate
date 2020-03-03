import mysql from 'mysql';
import util from 'util';

import utils from '../../utils';

let conn;

const checkDatabase = async (db) => {
  try {
    const path = 'server/storage/mysql/tables';
    const tables = await utils.readdirAsync(path);
    await conn.query(`create database if not exists ${db};`);
    await conn.query(`use ${db};`);

    const promises = tables.map(async (table) => {
      const tmp = await utils.readFileAsync(`${path}/${table}`);
      conn.query(tmp.toString('utf-8'));
    });

    await Promise.all(promises);
    conn.config.database = db;
  } catch (error) {
    throw (error);
  }
};

export default {
  connect: async (config) => {
    try {
      if (conn !== undefined) {
        await conn.ping();
        return;
      }

      const db = config.database;
      const { host, user, password } = config;
      const connection = mysql.createConnection({ host, user, password });
      connection.connect();
      conn = connection;
      await checkDatabase(db);
      conn.ping();
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
      conn = undefined;
    } catch (error) {
      throw (error);
    }
  },
};
