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

  private async checkDatabase() {
    const validatorsPath = `${process.cwd()}/src/storage/mongodb/validators`;
    const files = await utils.readdirAsync(validatorsPath);

    const promises = files.map(async (file) => {
      const lastIndex = file.lastIndexOf('.');
      const collection = file.substr(0, lastIndex);
      const buffer = await utils.readFileAsync(`${validatorsPath}/${file}`);
      return { name: collection, validator: JSON.parse(buffer.toString('utf-8')) };
    });

    const collectionsRequired = await Promise.all(promises);

    return new Promise((resolve, reject): void => {
      const map = new Map();
      try {
        this.database.listCollections().toArray((err: any, collections: unknown[]) => {
          if (err) {
            reject(err);
            return;
          }

          const cls = collections.map((item: { name: any; }) => item.name);

          cls.forEach(map.set.bind(map));

          collectionsRequired.forEach((target) => {
            if (!map.has(target.name)) {
              this.database.createCollection(target.name, target.validator);
            }
          });

          resolve(collections);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async connect(): Promise<void> {
    const {
      database,
      port,
      uri,
    } = config.mongo;

    const url = `mongodb://${uri}:${port}/${database}`;
    this.client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.database = this.client.db(database);
    this.bucket = new GridFSBucket(this.database);
    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }

  public getBucket(): MongoBucket {
    return this.bucket;
  }

  public getDatabase(): MongoDatabase {
    return this.database;
  }
}
