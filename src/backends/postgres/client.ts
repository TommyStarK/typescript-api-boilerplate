/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import { injectable } from 'inversify';
import { Pool } from 'pg';

import { AppConfig } from '@app/config';

import { PostgreSQLClientConfig } from './config';
import { Query } from './query';

@injectable()
export class PostgreSQLClient {
  private readonly _config: PostgreSQLClientConfig;
  private _pool: Pool = undefined;

  constructor() {
    this._config = AppConfig.postgres;
  }

  private async checkConnection(): Promise<void> {
    await this.pool().query('SELECT NOW()');
  }

  private async checkDatabase(): Promise<void> {
    const client = await this.pool().connect();

    client.release();
  }

  private pool(): Pool {
    if (this._pool === undefined) {
      throw new Error('PostgreSQLClient not connected');
    }

    return this._pool;
  }

  public get config(): PostgreSQLClientConfig {
    return this._config;
  }

  public async connect(): Promise<void> {
    if (this._pool !== undefined) {
      return this.checkConnection();
    }

    this._pool = new Pool(this._config);

    await Promise.all([
      this.checkConnection(),
      this.checkDatabase(),
    ]);
  }

  public async disconnect(): Promise<void> {
    await this.pool().end();
  }

  public async query<T>(wrapper: Query): Promise<T[]> {
    const queryResult = await this.pool().query<T>(wrapper.query, wrapper.values);

    return queryResult.rows;
  }

  public async runAtomicQueries(wrappers: Query[]): Promise<void> {
    const client = await this.pool().connect();

    try {
      await client.query('BEGIN');

      // eslint-disable-next-line no-restricted-syntax
      for (const wrapper of wrappers) {
        // eslint-disable-next-line no-await-in-loop
        await client.query(wrapper.query, wrapper.values);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
