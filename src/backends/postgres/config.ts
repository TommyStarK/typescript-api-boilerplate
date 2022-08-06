interface SSLOptions {
  rejectUnauthorized: boolean;
  ca: string | Buffer | Array<string | Buffer>;
}

export interface PostgreSQLClientConfig {
  host: string;
  port: number;
  database: string;
  max: number; // max number of connections
  user: string;
  password: string;
  ssl?: SSLOptions;
}
