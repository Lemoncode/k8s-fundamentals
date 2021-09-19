import redis from 'redis';
import config from '../config';

export const getRedisClient = () => redis.createClient({
  host: config.redis.host,
  port: config.redis.port
});