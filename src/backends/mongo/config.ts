interface SSLOptions {
  servername?: string;
  ssl?: boolean;
  poolSize?: number;
  sslCA?: ReadonlyArray<Buffer | string>;
}

export interface MongoDBClientConfig {
  host: string;
  port: number;
  database: string;
  auth?: {
    user: string;
    password: string;
  };
  loggerLevel?: string;
  ssl?: SSLOptions;
}
