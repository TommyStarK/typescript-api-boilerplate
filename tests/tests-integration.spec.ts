import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import request from 'supertest';

import config from '../src/config';
import { router } from '../src/router';

let token = '';
let pictureID = '';
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp2aW5jZW50IiwidXNlcklEIjoiNDA2NDUxMW1qczgybWprNCIsImlhdCI6MTU1MDM1NzE2OSwiZXhwIjoxNTUwNDQzNTY5fQ.CV7oQagJKtsBdO15PPt1sTmIe8cQ6_ewAVqQE0w-jn0';

async function createApp() {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', await router());
  return app;
}

describe('integration tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  test('500 Internal server error', async () => {
    const response = await request(app).get('/500');
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual('Internal server error');
  });

  test('ping service', async () => {
    const response = await request(app).get(`/${config.app.url}`);
    expect(response.status).toBe(200);
  });

  test('404 not found', async () => {
    const response = await request(app).get('/api.boilerplat');
    expect(response.status).toBe(404);
  });

  test('401 no token provided', async () => {
    const response = await request(app).get(`/${config.app.url}/dummy`);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('No token provided');
  });

  test('422 register new account without providing an email: should fail', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/register`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual(`Body missing 'email' field`);
  });

  test('register successfully a new account', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/register`)
      .send({ username: 'jest', password: '123123', email: 'jest@rocks.com' });

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Account has been registered');
  });

  test('409 failed to register a new account: email already used', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/register`)
      .send({ username: 'foo', password: '123123', email: 'jest@rocks.com' });

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual("Conflict: Email [jest@rocks.com] already used");
  });

  test('422 failed to retrieve a valid token, password not provided', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/authorize`)
      .send({ username: 'jest' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual(`Body missing 'password' field`);
  });

  test('successfully retrieve a valid token', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/authorize`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(200);
    expect(response.body.token).not.toEqual(undefined);
    token = response.body.token;
  });

  test('401 failed to retrieve a valid token: wrong credentials', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/authorize`)
      .send({ username: 'jest', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBe(undefined);
    expect(response.body.message).toEqual('Wrong credentials');
  });

  test('test /hello', async () => {
    const response = await request(app)
      .get(`/${config.app.url}/hello`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Hello jest');
  });

  test('query all picture but provide an invalid token: should fail', async () => {
    const response = await request(app)
      .get(`/${config.app.url}/pictures`)
      .set('Authorization', invalidToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Invalid token');
  });

  test('query all picture with a valid token: no existing picture', async () => {
    const response = await request(app)
      .get(`/${config.app.url}/pictures`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.pictures.length).toEqual(0);
  });

  test('upload a new picture', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test.png');

    expect(response.status).toBe(201);
    expect(response.body.pictureName).toEqual('test.png');
    expect(response.body.pictureID.length).not.toEqual(0);
    pictureID = String(response.body.pictureID);
    await new Promise((r) => setTimeout(r, 1000));
  });

  test('get a specific picture by ID', async () => {
    const response = await request(app)
      .get(`/${config.app.url}/picture/${pictureID}`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('test.png');
  });

  test('422 get a specific picture with invalid ID', async () => {
    const response = await request(app)
      .get(`/${config.app.url}/picture/44621c51`)
      .set('Authorization', token);

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual('Unprocessable Entity: picture ID must be a single string of either 12 bytes or 24 hex characters');
  });

  test('upload a picture which already exists', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test.png');

    expect(response.status).toBe(409);
    expect(response.body.message).toEqual("Conflict: Picture 'test.png' already exists");
  });

  test('upload a new picture, a second time', async () => {
    const response = await request(app)
      .post(`/${config.app.url}/picture`)
      .set('Authorization', token)
      .attach('file', './tests/testdata/test2.png');

      expect(response.status).toBe(201);
      expect(response.body.pictureName).toEqual('test2.png');
      expect(response.body.pictureID.length).not.toEqual(0);
      await new Promise((r) => setTimeout(r, 1000));
  });

  test('delete a specific picture', async () => {
    const response = await request(app)
      .delete(`/${config.app.url}/picture/${pictureID}`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(`Picture with ID (${pictureID}) has been deleted`);
    await new Promise((r) => setTimeout(r, 1000));
  });

  test('failed to unregister account, username not provided', async () => {
    const response = await request(app)
      .delete(`/${config.app.url}/unregister`)
      .send({ password: '123123' });

    expect(response.status).toBe(422);
    expect(response.body.message).toEqual(`Body missing 'username' field`);
  });

  test('unregister account', async () => {
    const response = await request(app)
      .delete(`/${config.app.url}/unregister`)
      .send({ username: 'jest', password: '123123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Account has been unregistered');
    await new Promise((r) => setTimeout(r, 1000));
  });
});
