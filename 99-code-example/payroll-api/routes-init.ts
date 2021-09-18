import { Express } from 'express';
import config from './config';
import { employeeRouter } from './routes';
import { getRedisClient } from './services/cache-factory.service';
import { cache } from './services/cache.service';

export const routesInit = (app: Express) => {
  console.log('routes init');
  let cacheService;

  if (config.redis.isEnabled) {
    console.log('redis is enabled')
    const redisClient = getRedisClient();
    cacheService = cache(redisClient);
    console.log('redis client created');
  }

  app.use('/api/employee', employeeRouter(cacheService));
};
