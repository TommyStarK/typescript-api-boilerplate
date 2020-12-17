import 'reflect-metadata';
import { Container } from 'inversify';

import { MySQLClient } from '@app/storage/mysql/client';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';

const IoCMySQLClientContainer = new Container();
IoCMySQLClientContainer.bind<MySQLClient>(IoCMySQLClientIdentifier).to(MySQLClient);
Object.seal(IoCMySQLClientContainer);

export default IoCMySQLClientContainer;
