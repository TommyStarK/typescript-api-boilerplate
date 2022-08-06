/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import 'reflect-metadata';

import { json as bodyParserJSON, urlencoded as bodyParserURLEncoded } from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import request from 'supertest';

import { AppConfig } from '../../src/config';
import { authMiddleware } from '../../src/middlewares';
import { exceptionsFilter } from '../../src/filters';

import container from '../../src/inversion-of-control/container';

import { MongoDBClient } from '../../src/backends/mongo';
import { PostgreSQLClient, Query } from '../../src/backends/postgres';
import { router } from '../../src/router';

import TYPES from '../../src/inversion-of-control/types';

let token = '';
let pictureID = '';

const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp2aW5jZW50IiwidXNlcklEIjoiNDA2NDUxMW1qczgybWprNCIsImlhdCI6MTU1MDM1NzE2OSwiZXhwIjoxNTUwNDQzNTY5fQ.CV7oQagJKtsBdO15PPt1sTmIe8cQ6_ewAVqQE0w-jn0';
const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZvbyIsInVzZXJJRCI6ImVld2s0MW1rdjZnMHRuOSIsImlhdCI6MTYzNTE1NzQxNiwiZXhwIjozMTcxNzk1OTk4MTZ9.fLzyfxL-u0mCWGMtUARRfTNGMq0XQ9at70QAUjbjVPI';

async function createApp(): Promise<express.Express> {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParserURLEncoded({ extended: true }), bodyParserJSON());
  app.use('/', await router());
  return app;
}

function internalServerErrorSetup(): express.Express {
  const app = express();
  app.all(`/${AppConfig.app.url}/*`, [authMiddleware(new PostgreSQLClient())]);
  app.get(`/${AppConfig.app.url}/hello`, (_: Request, res: Response) => res.status(200));
  app.use(exceptionsFilter);
  return app;
}

describe('integration tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    const mongo = container.get<MongoDBClient>(TYPES.MongoDBClient);
    const postgres = container.get<PostgreSQLClient>(TYPES.PostgreSQLClient);

    await Promise.all([
      mongo.disconnect(),
      postgres.disconnect(),
    ]);

    jest.clearAllMocks();
  });

  test('500 Internal server error', async () => {
    const response = await request(internalServerErrorSetup())
      .get(`/${AppConfig.app.url}/hello`)
      .set('Authorization', forgedToken);

    expect(response.status).toBe(500);
  });

  test('backend(s) client(s) not connected', async () => {
    const dummyMongoClient = new MongoDBClient();
    const dummyPostgreSQLClient = new PostgreSQLClient();

    await expect(dummyPostgreSQLClient.query(new Query('SELECT datname FROM pg_database;', []))).rejects.toThrow('PostgreSQLClient not connected');

    expect(dummyPostgreSQLClient.config.user).toEqual('root');
    expect(() => dummyMongoClient.bucket).toThrow('MongoDBCLient not connected');
    expect(() => dummyMongoClient.database).toThrow('MongoDBCLient not connected');
  });

  test('backend(s) client(s) connection(s)', async () => {
    const mongo = container.get<MongoDBClient>(TYPES.MongoDBClient);
    const postgres = container.get<PostgreSQLClient>(TYPES.PostgreSQLClient);

    await expect(mongo.connect()).resolves.not.toThrow();
    await expect(postgres.connect()).resolves.not.toThrow();
  });

  test('PostgreSQL atomic queries', async () => {
    const postgres = container.get<PostgreSQLClient>(TYPES.PostgreSQLClient);

    const queries = [
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key1', 'value1']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key2', 'value2']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key3', 'value3']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key4', 'value4']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key5', 'value5']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key6', 'value6']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key7', 'value7']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key8', 'value8']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key9', 'value9']),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, [undefined, {}]),
      new Query(`INSERT INTO foo ("bar", "baz") VALUES ($1, $2);`, ['key10', 'value10']),
    ];

    await expect(postgres.runAtomicQueries(queries)).rejects.toThrow();
  });

  test('healthcheck', async () => {
    const response = await request(app).get(`/${AppConfig.app.url}/healthz`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('ok');
  });

  test('404 not found', async () => {
    const response = await request(app).get('/api.boilerplat');

    expect(response.status).toBe(404);
  });

  test('401 no token provided', async () => {
    const response = await request(app).get(`/${AppConfig.app.url}/dummy`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('no token provided');
  });

  test('422 failed to register new account: missing/invalid email', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/register`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual('email must be an email');
  });

  test('register successfully a new account', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/register`)
      .send({ username: 'jest', password: '123123', email: 'jest@rocks.com' });

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Account has been registered');
  });

  test('409 failed to register a new account: email already used', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/register`)
      .send({ username: 'foo', password: '123123', email: 'jest@rocks.com' });

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual('Conflict: Email [jest@rocks.com] already used');
  });

  test('422 failed to retrieve a valid token: password not provided', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/authorize`)
      .send({ username: 'jest' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual('password must be a string');
  });

  test('successfully retrieve a valid token', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/authorize`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(200);
    expect(response.body.token).not.toEqual(undefined);

    token = response.body.token;
  });

  test('401 failed to retrieve a valid token: wrong credentials', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/authorize`)
      .send({ username: 'jest', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBe(undefined);
    expect(response.body.message).toEqual('wrong credentials');
  });

  test('test /hello', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/hello`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Hello jest');
  });

  test('failed to query all pictures: invalid token', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/pictures`)
      .set('Authorization', invalidToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('invalid token');
  });

  test('failed to query all pictures: no existing picture', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/pictures`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.pictures.length).toEqual(0);
  });

  test('415 upload Unsupported Media Type', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', '');

    expect(response.status).toBe(415);
    expect(response.body.message).toEqual('Unsupported Media Type: expecting form-data with key "file"');
  });

  test('upload a new picture', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test.png');

    expect(response.status).toBe(201);
    expect(response.body.name).toEqual('test.png');
    expect(response.body.id.length).not.toEqual(0);

    pictureID = String(response.body.id);

    await new Promise((r) => setTimeout(r, 1000));
  });

  test('get a specific picture by ID', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/picture/${pictureID}`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('test.png');
    expect(response.body.id).toEqual(pictureID);
    expect(response.body.picture.length).not.toEqual(0);
  });

  test('422 get a specific picture with invalid ID', async () => {
    const res = await request(app)
      .get(`/${AppConfig.app.url}/picture/44621c51`)
      .set('Authorization', token);

    expect(res.status).toBe(422);
    expect(res.body.message).toEqual('picture ID must be a single string of either 12 bytes or 24 hex characters');
  });

  test('404 get a specific picture with an ID which does not exist', async () => {
    const res = await request(app)
      .get(`/${AppConfig.app.url}/picture/${[...pictureID].reverse().join('')}`)
      .set('Authorization', token);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual(`Picture with ID (${[...pictureID].reverse().join('')}) not found`);
  });

  test('upload a picture which already exists', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test.png');

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual("Conflict: Picture 'test.png' already exists");
  });

  test('upload a new picture, a second time', async () => {
    const response = await request(app)
      .post(`/${AppConfig.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test2.png');

    expect(response.status).toBe(201);
    expect(response.body.name).toEqual('test2.png');
    expect(response.body.id.length).not.toEqual(0);

    await new Promise((r) => setTimeout(r, 1000));
  });

  test('query all pictures', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/pictures`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.pictures.length).toEqual(2);
    expect(response.body.pictures[0].name).toEqual('test.png');
    expect(response.body.pictures[0].fileid).toEqual(pictureID);
    expect(response.body.pictures[1].name).toEqual('test2.png');
  });

  test('delete a specific picture', async () => {
    const response = await request(app)
      .delete(`/${AppConfig.app.url}/picture/${pictureID}`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(`Picture with ID (${pictureID}) has been deleted`);
  });

  test('404 delete a picture which does not exist', async () => {
    const response = await request(app)
      .delete(`/${AppConfig.app.url}/picture/${[...pictureID].reverse().join('')}`)
      .set('Authorization', token);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(`Picture with ID (${[...pictureID].reverse().join('')}) not found`);
  });

  test('failed to unregister account, username not provided', async () => {
    const response = await request(app)
      .delete(`/${AppConfig.app.url}/unregister`)
      .send({ password: '123123' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual('username must be a string');
  });

  test('failed to unregister account, wrong credentials', async () => {
    const response = await request(app)
      .delete(`/${AppConfig.app.url}/unregister`)
      .send({ username: 'jest', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('wrong credentials');
  });

  test('unregister account', async () => {
    const response = await request(app)
      .delete(`/${AppConfig.app.url}/unregister`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Account has been unregistered');
  });

  test('test /hello with a valid token but from a deleted account', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/hello`)
      .set('Authorization', token);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('forbidden');
  });
});
