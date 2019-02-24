import mysql from 'mysql';
import util from 'util';
import utils from '../utils';

let conn;

const checkDatabase = async (db) => {
  try {
    const path = 'src/database/sql';
    const tables = await utils.readdirAsync(path);
    await conn.query(`create database if not exists ${db};`);
    await conn.query(`use ${db};`);
    
    for (const table of tables) {
      const tmp  = await utils.readFileAsync(`${path}/${table}`);
      await conn.query(tmp.toString('utf-8'));  
    }

    conn.config.database = db;
  } catch (error) {
    throw (error);
  }
};

export default {
  connect: async (config) => {
    try {
      if (conn !== undefined) {
        console.log('MySQL client already connected.');
        await conn.ping();
        return;
      }

      const db = config.database;
      const { host, user, password } = config;
      const connection = mysql.createConnection({ host, user, password });
      await connection.connect();
      conn = connection;
      await checkDatabase(db);
      await conn.ping();
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
