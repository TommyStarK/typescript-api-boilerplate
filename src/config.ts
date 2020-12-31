interface IAppConfig {
  app: {
    name: string;
    url: string;
    http: {
      port: number;
    },
    https: {
      port: number;
      tls: {
        certificate: string;
        key: string;
        path: string;
      },
    },
    secret: string;
    expiresIn: string;
    production: boolean;
  },
  mongo: {
    port: string;
    uri: string;
    database: string;
  },
  mysql: {
    host: string;
    user: string;
    password: string;
    database: string;
  },
}

const AppConfig: IAppConfig = {
  app: {
    name: 'Experimental REST API boilerplate',
    url: 'api.boilerplate',
    http: { port: 3001 },
    https: {
      port: 8443,
      tls: { certificate: 'server.crt', key: 'key.pem', path: 'tls/' },
    },
    secret: '1S3cR€T!',
    expiresIn: '24h',
    production: false,
  },
  mongo: {
    port: '27017',
    uri: process.env.MONGO_URI || 'localhost',
    database: 'experimental_rest_api_boilerplate_mongodb',
  },
  mysql: {
    host: process.env.MYSQL_URL || '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'experimental_rest_api_boilerplate_mysql',
  },
};

export {
  IAppConfig,
  AppConfig,
};
