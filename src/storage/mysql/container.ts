import { Container } from 'inversify';
import { MySQLClient } from '@app/storage/mysql/client';

const identifier = Symbol.for('MySQLClient');
Object.seal(identifier);

const container = new Container();
container.bind<MySQLClient>(identifier).to(MySQLClient);
Object.seal(container);

export {
  container as IoCMySQLClientContainer,
  identifier as IoCMySQLClientIdentifier,
};
