/* eslint-disable @typescript-eslint/lines-between-class-members */
import { injectable } from 'inversify';
import { MongoClient, GridFSBucket, Db } from 'mongodb';

import config from '@app/config';
import utils from '@app/utils';

type MongoBucket = GridFSBucket;
type MongoDatabase = Db;

@injectable()
export class MongoDBClient {
  private bucket: GridFSBucket;
  private client: MongoClient;
  private database: Db;

  constructor() {
    this.bucket = undefined;
    this.client = undefined;
    this.database = undefined;
  }

  private async checkConnection(): Promise<void> {
    if (!this.client.isConnected()) {
      throw new Error('MongoDBClient not connected');
    }
  }

  private async checkDatabase(): Promise<void> {
    const validatorsPath = `${process.cwd()}/src/storage/mongodb/validators`;
    const files = await utils.readdirAsync(validatorsPath);

    const promises = files.map(async (file): Promise<{name: string, validator: object}> => {
      const lastIndex = file.lastIndexOf('.');
      const collection = file.substr(0, lastIndex);
      const buffer = await utils.readFileAsync(`${validatorsPath}/${file}`);
      return { name: collection, validator: JSON.parse(buffer.toString('utf-8')) };
    });

    const witness = new Map();
    const collectionsRequired = await Promise.all(promises);
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
      await this.checkConnection();
      return;
    }

    const {
      database,
      port,
      uri,
    } = config.mongo;

    const url = `mongodb://${uri}:${port}/${database}`;
    this.client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.database = this.client.db(database);
    this.bucket = new GridFSBucket(this.database);

    await this.checkConnection();
    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    if (this.client !== undefined) {
      // await this.client.logout();
      await this.client.close();
    }
  }

  public getBucket(): MongoBucket {
    if (this.bucket === undefined) {
      throw new Error('MongoDBCLient not fully ready, call \'connect():Promise<void>\' before');
    }
    return this.bucket;
  }

  public getDatabase(): MongoDatabase {
    if (this.database === undefined) {
      throw new Error('MongoDBCLient not fully ready, call \'connect():Promise<void>\' before');
    }
    return this.database;
  }
}
