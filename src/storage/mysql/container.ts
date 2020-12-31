import { Container } from 'inversify';

import { MySQLClient } from '@app/storage/mysql/client';

const IoCMySQL = {
  ClientIdentifier: Symbol.for('MySQLClient'),
};

Object.seal(IoCMySQL);

const MySQLContainer = new Container();
MySQLContainer.bind<MySQLClient>(IoCMySQL.ClientIdentifier).to(MySQLClient);
Object.seal(MySQLContainer);

export {
  IoCMySQL,
  MySQLContainer,
};
