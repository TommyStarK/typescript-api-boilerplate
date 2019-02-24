import test from 'ava';
import request from 'supertest';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import config from '../src/config';
import mongo from '../src/database/mongo';
import mysql from '../src/database/mysql';
import redis from '../src/cache/redis';
import router from '../src/router';

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
  // await mysql.connect(config.mysql);
  await redis.connect(config.redis);
  const app = createApp();
  t.context.app = app;
});

test.serial('ping service', async (t) => {
  t.plan(1);
  const {app} = t.context;
  const res = await request(app).get(`/${config.app.url}`);
  t.is(res.status, 200);
});

test.serial('404 not found', async (t) => {
  t.plan(1);
  const {app} = t.context;
  const res = await request(app).get('/api.boilerplat');
  t.is(res.status, 404);
});

test.serial('no token provided', async (t) => {
  t.plan(1);
  const {app} = t.context;
  const res = await request(app).get(`/${config.app.url}/dummy`);
  t.is(res.status, 401);
});

// test.serial('register:Success', async (t) => {
//   t.plan(1);
//   const {app} = t.context;
// 	const res = await request(app)
// 		.post(`/${config.app.url}/register`)
// 		.send({username:'ava', password: '123123', email: 'ava@rocks.com'});

//   console.log(res);
//   console.log(res.body);
// 	t.is(res.status, 201);
// });

test.afterEach.always(async () => {
  await mongo.quit();
  // await mysql.quit();
  await redis.quit();
});
