// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import config from '../server/config';
import mongo from '../server/storage/mongodb';
import mysql from '../server/storage/mysql';
import router from '../server/router';

let token = '';
let pictureID = '';
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp2aW5jZW50IiwidXNlcklEIjoiNDA2NDUxMW1qczgybWprNCIsImlhdCI6MTU1MDM1NzE2OSwiZXhwIjoxNTUwNDQzNTY5fQ.CV7oQagJKtsBdO15PPt1sTmIe8cQ6_ewAVqQE0w-jn0';

function createApp() {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', router);
  return app;
}

test.beforeEach(async (t) => {
  await mongo.connect(config.mongo);
  await mysql.connect(config.mysql);
  const app = createApp();
  // eslint-disable-next-line no-param-reassign
  t.context.app = app;
});

test.serial('ping service', async (t) => {
  const { app } = t.context;
  const res = await request(app).get(`/${config.app.url}`);
  t.is(res.status, 200);
});

test.serial('404 not found', async (t) => {
  const { app } = t.context;
  const res = await request(app).get('/api.boilerplat');
  t.is(res.status, 404);
});

test.serial('no token provided', async (t) => {
  const { app } = t.context;
  const res = await request(app).get(`/${config.app.url}/dummy`);
  t.is(res.status, 401);
});

test.serial('register new account without providing email: should fail', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/register`)
    .send({ username: 'ava', password: '123123' });

  t.is(res.status, 422);
});

test.serial('register successfully a new account', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/register`)
    .send({ username: 'ava', password: '123123', email: 'ava@rocks.com' });

  t.is(res.status, 201);
});

test.serial('failed to register a new account: email missing', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/register`)
    .send({ username: 'ava', password: '123123' });

  // eslint-disable-next-line quotes
  t.true(res.body.message === `Body missing 'email' field`);
  t.is(res.status, 422);
});

test.serial('failed to register a new account: email already used', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/register`)
    .send({ username: 'ava', password: '123123', email: 'ava@rocks.com' });

  t.is(res.status, 409);
});

test.serial('failed to retrieve a valid token, password not provided', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/authorize`)
    .send({ username: 'ava' });

  // eslint-disable-next-line quotes
  t.true(res.body.message === `Body missing 'password' field`);
  t.is(res.status, 422);
});

test.serial('successfully retrieve a valid token', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/authorize`)
    .send({ username: 'ava', password: '123123' });

  t.true(res.body.token !== undefined);
  // eslint-disable-next-line prefer-destructuring
  token = res.body.token;
  t.is(res.status, 200);
});

test.serial('failed to retrieve a valid token: wrong credentials', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/authorize`)
    .send({ username: 'ava', password: 'wrongpassword' });

  t.true(res.body.token === undefined);
  t.true(res.body.message === 'Wrong credentials');
  t.is(res.status, 401);
});

test.serial('test hello route', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .get(`/${config.app.url}/hello`)
    .set('x-access-token', token);

  t.true(res.body.message.length > 0);
  t.true(res.body.message === 'Hello ava');
  t.is(res.status, 200);
});

test.serial('query all picture but provide an invalid token: should fail', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .get(`/${config.app.url}/pictures`)
    .set('Authorization', invalidToken);

  t.true(res.body.message === 'Invalid token');
  t.is(res.status, 401);
});

test.serial('query all picture with a valid token: no existing picture', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .get(`/${config.app.url}/pictures`)
    .set('x-access-token', token);

  t.is(res.status, 200);
  t.true(res.body.pictures.length === 0);
});

test.serial('upload a new picture', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/picture`)
    .set('x-access-token', token)
    .attach('file', './test/testdata/test.png');

  t.true(res.body.pictureName === 'test.png');
  t.true(res.body.pictureID !== undefined && res.body.pictureID.length > 0);
  t.is(res.status, 201);
  pictureID = String(res.body.pictureID);
  await new Promise((r) => setTimeout(r, 1000));
});

test.serial('get a specific picture by ID', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .get(`/${config.app.url}/picture/${pictureID}`)
    .set('x-access-token', token);

  t.true(res.body.name === 'test.png');
  t.is(res.status, 200);
});

test.serial('upload a picture which already exists', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/picture`)
    .set('x-access-token', token)
    .attach('file', './test/testdata/test.png');

  t.true(res.body.message === "Conflict: Picture 'test.png' already exists");
  t.is(res.status, 409);
});

test.serial('upload a new picture, a second time', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .post(`/${config.app.url}/picture`)
    .set('x-access-token', token)
    .attach('file', './test/testdata/test2.png');

  t.true(res.body.pictureName === 'test2.png');
  t.true(res.body.pictureID !== undefined && res.body.pictureID.length > 0);
  t.is(res.status, 201);
  await new Promise((r) => setTimeout(r, 1000));
});

test.serial('delete a specific picture', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .delete(`/${config.app.url}/picture/${pictureID}`)
    .set('x-access-token', token);

  t.true(res.body.message === `Picture with ID (${pictureID}) has been deleted`);
  t.is(res.status, 200);
  await new Promise((r) => setTimeout(r, 1000));
});


test.serial('failed to unregister account, username not provided', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .delete(`/${config.app.url}/unregister`)
    .send({ password: '123123' });

  // eslint-disable-next-line quotes
  t.true(res.body.message === `Body missing 'username' field`);
  t.is(res.status, 422);
});

test.serial('unregister account', async (t) => {
  const { app } = t.context;
  const res = await request(app)
    .delete(`/${config.app.url}/unregister`)
    .send({ username: 'ava', password: '123123' });

  t.true(res.body.message === 'Account has been unregistered');
  t.is(res.status, 200);
  await new Promise((r) => setTimeout(r, 1000));
});

test.afterEach.always(async () => {
  await mongo.quit();
  await mysql.quit();
});
