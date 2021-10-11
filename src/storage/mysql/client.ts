import { injectable } from 'inversify';
import mysql from 'mysql2/promise';

import { AppConfig } from '@app/config';
import utils from '@app/utils';

@injectable()
export class MySQLClient {
  private readonly hydratationPath: string = 'src/storage/mysql/tables';
  private pool: mysql.Pool = undefined;

  constructor() {}

  private async checkConnection(): Promise<void> {
    const connection = await this.pool.getConnection();
    await connection.ping();
    connection.release();
  }

  private async checkDatabase(): Promise<void> {
    const connection = await this.pool.getConnection();
    await connection.query(`create database if not exists ${AppConfig.mysql.database};`);
    await connection.query(`use ${AppConfig.mysql.database};`);

    const tables: string[] = await utils.readdirAsync(this.hydratationPath);
    const thenables = tables.map(async (table): Promise<void> => {
      const tmp: Buffer = await utils.readFileAsync(`${this.hydratationPath}/${table}`);
      connection.query(tmp.toString('utf-8'));
    });

    await Promise.all(thenables);
    connection.release();
  }

  public async connect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.checkConnection();
      return;
    }

    const {
      database, host, user, password,
    } = AppConfig.mysql;

    this.pool = mysql.createPool({
      connectionLimit: 1,
      host,
      user,
      password,
    });

    await this.checkDatabase();
    await this.pool.end();

    this.pool = mysql.createPool({
      connectionLimit: 10,
      database,
      host,
      user,
      password,
    });

    await this.checkConnection();
  }

  public async disconnect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.pool.end();
      this.pool = undefined;
    }
  }

  public async query<T>(sql: string, values: any): Promise<T[]> {
    if (this.pool === undefined) {
      throw new Error('MySQLClient not connected');
    }

    const connection = await this.pool.getConnection();
    const [rows] = await connection.query(sql, values);
    connection.release();
    return rows as unknown as T[];
  }
}
