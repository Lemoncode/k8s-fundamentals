import { Express } from 'express';
import config from './config';
import { employeeRouter } from './routes';
import { getRedisClient } from './services/cache-factory.service';
import { cache } from './services/cache.service';
import { getDalClient } from './services/dal-factory.service';
import { dal } from './services/dal.service';

export const routesInit = async (app: Express) => {
  console.log('routes init');
  let cacheService;
  let dalService;

  if (config.redis.isEnabled) {
    console.log('redis is enabled')
    const redisClient = getRedisClient();
    cacheService = cache(redisClient);
    console.log('redis client created');
  }

  if (config.mongo.isEnabled) {
    console.log('mongo is enabled');
    const dalClient = await getDalClient();
    dalService = dal(dalClient)
    console.log('mongo dal created');
  }

  app.use('/api/employee', employeeRouter(cacheService, dalService));
};
