import { Express } from 'express';
import config from './config';
import { employeeRouter } from './routes';
import { getRedisClient } from './services/cache-factory.service';
import { cache } from './services/cache.service';

export const routesInit = (app: Express) => {
  let cacheService;

  if (config.redis.isEnabled) {
    const redisClient = getRedisClient();
    cacheService = cache(redisClient);
  }

  app.use('/api/employee', employeeRouter(cacheService));
};
