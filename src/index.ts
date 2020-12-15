// import 'reflect-metadata';

// import utils from '@app/utils';
// import logger from '@app/logger';
// import { container, MySQLClient, TYPES } from '@app/storage/mysql';

// logger.info(utils.validateEmail('test@test.com'));
// logger.info(utils.hash('test') === '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
// const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
// (async () => {
//   await mysql.connect();
//   const conn = await mysql.getConnection();
//   const b = await conn.query('select * from users');
//   console.log(b);
//   conn.release();
// })();
