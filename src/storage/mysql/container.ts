import { Container } from 'inversify';
import { MySQLClient } from '@app/storage/mysql/client';

const TYPES = { MySQLClient: Symbol.for('MySQLClient') };
Object.seal(TYPES);

const container = new Container();
container.bind<MySQLClient>(TYPES.MySQLClient).to(MySQLClient);
Object.seal(container);

export {
  container,
  TYPES,
};
