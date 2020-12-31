import { Container } from 'inversify';

import { MySQLClient } from '@app/storage/mysql/client';
import TYPES from '@app/IoC/types';

const MySQLContainer = new Container();
MySQLContainer.bind<MySQLClient>(TYPES.MySQLClient).to(MySQLClient);
Object.seal(MySQLContainer);

export default MySQLContainer;
