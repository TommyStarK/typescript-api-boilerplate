/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable no-underscore-dangle */
import { injectable } from 'inversify';

import {
  MongoClient,
  GridFSBucket,
  Db,
  Collection,
} from 'mongodb';

import { AppConfig } from '@app/config';
import { readdirAsync, readFileAsync } from '@app/utils/filesystem';

@injectable()
export class MongoDBClient {
  private readonly validatorsPath = 'src/backends/mongo/validators';
  private _bucket: GridFSBucket = undefined;
  private _client: MongoClient = undefined;
  private _database: Db = undefined;

  constructor() {}

  private client(): MongoClient {
    if (!this._client) {
      throw new Error('MongoDBCLient not connected');
    }

    return this._client;
  }

  private checkConnection(): boolean {
    return this.client().isConnected() && this._database !== undefined && this._bucket !== undefined;
  }

  private async checkDatabase(): Promise<void> {
    const witness = new Map();
    const collectionsRequired: { name: string, validator: object }[] = [];

    const files = await readdirAsync(this.validatorsPath);

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const lastIndex = file.lastIndexOf('.');
      const collection = file.substring(0, lastIndex);

      // eslint-disable-next-line no-await-in-loop
      const buffer = await readFileAsync(`${this.validatorsPath}/${file}`);

      collectionsRequired.push({ name: collection, validator: JSON.parse(buffer.toString('utf-8')) });
    }

    const existingCollections = await this.database.listCollections().toArray();

    const namesOfExistingCollections = existingCollections.map((collection: { name: string }) => collection.name);
    namesOfExistingCollections.forEach(witness.set.bind(witness));

    const collectionsToCreate = collectionsRequired
      .filter((collection) => !witness.has(collection.name))
      .map(async (c): Promise<Collection<any>> => this.database.createCollection(c.name, c.validator));

    await Promise.all(collectionsToCreate);
  }

  public async connect(): Promise<void> {
    if (this._client !== undefined && this.checkConnection()) {
      return;
    }

    const {
      database,
      host,
      port,
    } = AppConfig.mongo;

    const url = `mongodb://${host}:${port}/${database}`;

    // https://stackoverflow.com/a/14464750/9093211
    this._client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    this._database = this.client().db(database);
    this._bucket = new GridFSBucket(this._database);

    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    await this.client().close();
  }

  public get bucket(): GridFSBucket {
    this.checkConnection();

    return this._bucket;
  }

  public get database(): Db {
    this.checkConnection();

    return this._database;
  }
}
