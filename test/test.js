import test from 'ava';
import request from 'supertest';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import router from '../src/router';
import config from '../src/config';

function createApp() {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', router);
  return app;
}

test('Ping service', async (t) => {
  t.plan(1);
  const res = await request(createApp()).get(`/${config.app.url}`);
  t.is(res.status, 200);
});

test('404 not found', async (t) => {
  t.plan(1);
  const res = await request(createApp()).get('/foo');
  t.is(res.status, 404);
});

test('No token provided', async (t) => {
  t.plan(1);
  const res = await request(createApp()).get(`/${config.app.url}/bar`);
  t.is(res.status, 401);
});

test('Account registration', async (t) => {
  t.plan(1);

  const res = await request(createApp()).post(`${config.app.url}/register`)
    .send({ email: 'foo@email.com', password: 'bar', username: 'foo' });

  t.is(res.status, 201);
});
