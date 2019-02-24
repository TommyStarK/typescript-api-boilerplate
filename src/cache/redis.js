import IoRedis from 'ioredis';

let client;

export default {
  connect: async (config) => {
    try {
      if (client !== undefined) {
        console.log('Redis client already connected.');
        await client.ping();
        return;
      }

      client = new IoRedis(
        config !== undefined ? config : {
          port: 6379, host: '127.0.0.1', family: 4, db: 0,
        },
      );

      await client.ping();
    } catch (error) {
      throw (error);
    }
  },

  getClient: () => client,

  quit: async () => {
    try {
      await client.quit();
      client = undefined;
    } catch (error) {
      throw (error);
    }
  },
};
