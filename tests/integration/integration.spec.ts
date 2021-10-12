import 'reflect-metadata';
import { json as bodyParserJSON, urlencoded as bodyParserURLEncoded } from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import request from 'supertest';

import { AppConfig } from '../../src/config';
import { MongoDBClient } from '../../src/storage/mongodb';
import { MySQLClient } from '../../src/storage/mysql';
import { router } from '../../src/router';
import container from '../../src/IoC/container';
import TYPES from '../../src/IoC/types';
import { authMiddleware, errorMiddleware } from '../../src/middlewares';

let token = '';
let pictureID = '';
/* eslint-disable max-len */
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp2aW5jZW50IiwidXNlcklEIjoiNDA2NDUxMW1qczgybWprNCIsImlhdCI6MTU1MDM1NzE2OSwiZXhwIjoxNTUwNDQzNTY5fQ.CV7oQagJKtsBdO15PPt1sTmIe8cQ6_ewAVqQE0w-jn0';
/* eslint-disable max-len */
const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZvbyIsInVzZXJJRCI6IjQwNHQyazJva3Vuc290azAiLCJpYXQiOjE2MzQwMjU2NjYsImV4cCI6MTYzNDExMjA2Nn0.ZlAI4PXw9Rz2QXK894d8R4_cnqTXsD8ZReT2haBV5tQ';

async function createApp(): Promise<express.Express> {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParserURLEncoded({ extended: true }), bodyParserJSON());
  app.use('/', await router());
  return app;
}

function internalServerErrorSetup(): express.Express {
  const app = express();
  app.all(`/${AppConfig.app.url}/*`, [authMiddleware(new MySQLClient())]);
  app.get(`/${AppConfig.app.url}/hello`, (_: Request, res: Response) => res.status(200));
  app.use(errorMiddleware);
  return app;
}

describe('integration tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    const mongodb = container.get<MongoDBClient>(TYPES.MongoDBClient);
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    await mongodb.disconnect();
    await mysql.disconnect();
    jest.clearAllMocks();
  });

  test('500 Internal server error', async () => {
    const response = await request(internalServerErrorSetup())
      .get(`/${AppConfig.app.url}/hello`)
      .set('Authorization', forgedToken);

    expect(response.status).toBe(500);
  });

  test('client(s) storage(s) connection(s)', async () => {
    const dummyMySQL = new MySQLClient();
    await expect(dummyMySQL.query('show databases', [])).rejects.toThrow('MySQLClient not connected');
    const dummyMongo = new MongoDBClient();
    expect(() => dummyMongo.getBucket()).toThrow('MongoDBCLient not connected');
    expect(() => dummyMongo.getDatabase()).toThrow('MongoDBCLient not connected');
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    await expect(mysql.connect()).resolves.not.toThrow();
    const mongodb = container.get<MongoDBClient>(TYPES.MongoDBClient);
    await expect(mongodb.connect()).resolves.not.toThrow();
  });

  test('ping service', async () => {
    const response = await request(app).get(`/${AppConfig.app.url}`);
    expect(response.status).toBe(200);
  });

  test('404 not found', async () => {
    const response = await request(app).get('/api.boilerplat');
    expect(response.status).toBe(404);
  });

  test('401 no token provided', async () => {
    const response = await request(app).get(`/${AppConfig.app.url}/dummy`);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('No token provided');
  });

  test('422 register new account without providing an email: should fail', async () => {
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

  test('422 failed to retrieve a valid token, password not provided', async () => {
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
    expect(response.body.message).toEqual('Wrong credentials');
  });

  test('test /hello', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/hello`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Hello jest');
  });

  test('query all picture but provide an invalid token: should fail', async () => {
    const response = await request(app)
      .get(`/${AppConfig.app.url}/pictures`)
      .set('Authorization', invalidToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Invalid token');
  });

  test('query all picture with a valid token: no existing picture', async () => {
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
      .attach('file', undefined);

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
    expect(response.body.message).toEqual('Wrong credentials');
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
    expect(response.body.message).toEqual('Forbidden');
  });
});
