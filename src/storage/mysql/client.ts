/* eslint-disable @typescript-eslint/lines-between-class-members */
import { injectable } from 'inversify';
import mysql from 'mysql2/promise';

import config from '@app/config';
import utils from '@app/utils';

type MySQLConn = mysql.PoolConnection;

@injectable()
export class MySQLClient {
  private readonly hydratationPath: string = 'server/storage/mysql/tables';
  private pool: mysql.Pool;

  private async checkConnection(): Promise<void> {
    const connection: MySQLConn = await this.getConnection();
    await connection.ping();
    connection.release();
  }

  private async checkDatabase(): Promise<void> {
    const connection: MySQLConn = await this.getConnection();
    await connection.query(`create database if not exists ${config.mysql.database};`);
    await connection.query(`use ${config.mysql.database};`);

    const tables: string[] = await utils.readdirAsync(this.hydratationPath);
    const promises = tables.map(async (table): Promise<void> => {
      const tmp: Buffer = await utils.readFileAsync(`${this.hydratationPath}/${table}`);
      connection.query(tmp.toString('utf-8'));
    });

    await Promise.all(promises);
    connection.release();
  }

  public async connect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.checkConnection();
      return;
    }

    const {
      host, user, password,
    } = config.mysql;

    this.pool = mysql.createPool({
      connectionLimit: 10,
      host,
      user,
      password,
    });

    await this.checkDatabase();
    await this.checkConnection();
  }

  public async disconnect(): Promise<void> {
    await this.pool.end();
    this.pool = undefined;
  }

  public async getConnection(): Promise<MySQLConn> {
    const conn: MySQLConn = await this.pool.getConnection();
    return conn;
  }

  public query() {
    return this.pool.query;
  }
}
