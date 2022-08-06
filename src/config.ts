import { MongoDBClientConfig } from './backends/mongo';
import { PostgreSQLClientConfig } from './backends/postgres';

interface IAppConfig {
  app: {
    production: boolean;
    url: string;
    port: number;
    secret: string;
    expiresIn: string;
    https: {
      port: number;
      tls: {
        certificate: string;
        key: string;
      },
    },
  },
  mongo: MongoDBClientConfig,
  postgres: PostgreSQLClientConfig,
}

const AppConfig: IAppConfig = {
  app: {
    url: 'api.boilerplate',
    port: 3001,
    production: false,
    secret: '1S3cR€T!',
    expiresIn: '24h',
    https: {
      port: 8443,
      tls: {
        certificate: 'tls/server.crt',
        key: 'tls/key.pem',
      },
    },
  },
  mongo: {
    database: 'dummy',
    host: process.env.MONGO_URI || 'localhost',
    port: 27017,
  },
  postgres: {
    database: 'dummy',
    host: process.env.POSTGRES_URL || '127.0.0.1',
    port: 5432,
    max: 10,
    user: 'root',
    password: 'root',
  },
};

export {
  IAppConfig,
  AppConfig,
};
