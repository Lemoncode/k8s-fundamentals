import redis from 'redis';
import config from '../config';

const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port
});

export const getRedisClient = () => client;