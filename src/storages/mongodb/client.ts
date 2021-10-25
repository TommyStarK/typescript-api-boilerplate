/* eslint-disable @typescript-eslint/lines-between-class-members */
import { injectable } from 'inversify';
import { MongoClient, GridFSBucket, Db } from 'mongodb';

import { AppConfig } from '@app/config';
import utils from '@app/utils';

@injectable()
export class MongoDBClient {
  private readonly validatorsPath: string = 'src/storages/mongodb/validators';
  private bucket: GridFSBucket = undefined;
  private client: MongoClient = undefined;
  private database: Db = undefined;

  constructor() {}

  private checkConnection(): boolean {
    if (this.client === undefined) {
      throw new Error('MongoDBCLient not connected');
    }
    return true;
  }

  private async checkDatabase(): Promise<void> {
    const files = await utils.readdirAsync(this.validatorsPath);
    const thenables = files.map(async (file): Promise<{ name: string, validator: object }> => {
      const lastIndex = file.lastIndexOf('.');
      const collection = file.substr(0, lastIndex);
      const buffer = await utils.readFileAsync(`${this.validatorsPath}/${file}`);
      return { name: collection, validator: JSON.parse(buffer.toString('utf-8')) };
    });

    const witness = new Map();
    const collectionsRequired = await Promise.all(thenables);
    const existingCollections = await this.database.listCollections().toArray();
    const namesOfExistingCollections = existingCollections.map((collection: { name: string }) => collection.name);
    namesOfExistingCollections.forEach(witness.set.bind(witness));

    const collectionsToCreate = collectionsRequired
      .filter((collection) => !witness.has(collection.name))
      .map(async (collection): Promise<void> => {
        await this.database.createCollection(collection.name, collection.validator);
      });

    await Promise.all(collectionsToCreate);
  }

  public async connect(): Promise<void> {
    if (this.client !== undefined) {
      if (this.checkConnection()) {
        return;
      }
    }

    const {
      database,
      port,
      uri,
    } = AppConfig.mongo;

    const url = `mongodb://${uri}:${port}/${database}`;
    this.client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.database = this.client.db(database);
    this.bucket = new GridFSBucket(this.database);

    this.checkConnection();
    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    if (this.client !== undefined) {
      await this.client.close();
    }
  }

  public getBucket(): GridFSBucket {
    this.checkConnection();
    return this.bucket;
  }

  public getDatabase(): Db {
    this.checkConnection();
    return this.database;
  }
}
