import { Container } from 'inversify';

import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import { MySQLClient } from '@app/storage/mysql/client';

const IoCMySQLClientContainer = new Container();
IoCMySQLClientContainer.bind<MySQLClient>(IoCMySQLClientIdentifier.Symbol).to(MySQLClient);
Object.seal(IoCMySQLClientContainer);

export default IoCMySQLClientContainer;
