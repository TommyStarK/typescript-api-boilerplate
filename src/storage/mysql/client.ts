/* eslint-disable @typescript-eslint/lines-between-class-members */
import { injectable } from 'inversify';
import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { AppConfig } from '@app/config';
import utils from '@app/utils';

type MySQLConn = mysql.PoolConnection;

@injectable()
export class MySQLClient {
  private readonly hydratationPath: string = 'src/storage/mysql/tables';
  private pool: mysql.Pool = undefined;

  constructor() {}

  private async checkConnection(): Promise<void> {
    const connection: MySQLConn = await this.getConnection();
    await connection.ping();
    connection.release();
  }

  private async checkDatabase(): Promise<void> {
    const connection: MySQLConn = await this.getConnection();
    await connection.query(`create database if not exists ${AppConfig.mysql.database};`);
    await connection.query(`use ${AppConfig.mysql.database};`);

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
    } = AppConfig.mysql;

    this.pool = mysql.createPool({
      connectionLimit: 10,
      host,
      user,
      password,
    });

    await this.checkConnection();
    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.pool.end();
      this.pool = undefined;
    }
  }

  public async getConnection(): Promise<MySQLConn> {
    if (this.pool === undefined) {
      throw new Error('MySQLClient not connected, call \'connect(): Promise<void>\' before');
    }

    const conn: MySQLConn = await this.pool.getConnection();
    return conn;
  }

  public processRows(rows: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): any[] {
    return [rows].map((row) => (JSON.parse(JSON.stringify(row)).length ? { ...row } : undefined))
      .filter((elem) => elem !== undefined)
      // handle BinaryRow
      .map((elem) => (elem['0']));
  }

  public query() {
    return this.pool.query;
  }
}
