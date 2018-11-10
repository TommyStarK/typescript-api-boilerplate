import mysql from 'mysql';

let _connection = undefined;

async function checkDatabase(db) {
  try {
    await _connection.query(`CREATE DATABASE IF NOT EXISTS ${db};`);
    await _connection.query(`USE ${db};`);
  } catch (error) {
    throw(error);
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

  getConnection: () => {
    return _connection;
  },

  quit: async () => {
    try {
      await _connection.end();
    } catch (error) {
      throw (error);
    }
  }
};