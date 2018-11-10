import ioredis from 'ioredis';

let _client = undefined;

export const redis = {
  connect: async (config) => {
    try {
      if (_client !== undefined) {
        console.log('Redis client already connected.');
        await _client.ping();
        return;
      }

      _client = new ioredis(
          config !== undefined ?
              config :
              {port: 6379, host: '127.0.0.1', family: 4, db: 0});

      await _client.ping();
    } catch (error) {
      throw (error);
    }
  },

  getClient: () => {
    return _client;
  },

  quit: async () => {
    try {
      await _client.quit();
    } catch (error) {
      throw (error);
    }
  }
};