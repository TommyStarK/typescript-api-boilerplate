import fs from 'fs';
import http from 'http';
import https from 'https';

function createHttpServer(app) {
  return http.createServer(app);
}

function createHttpsServer(app, config) {
  let credentials = {
    cert: fs.readFileSync(config.ssl.path+config.ssl.certificate, 'utf8'),
    key: fs.readFileSync(config.ssl.path+config.ssl.key, 'utf8')
  };
  
  return https.createServer(credentials, app);
}

export {createHttpServer, createHttpsServer};