import 'dotenv/config'

export default {
  http: {
    port: process.env.PORT || '3000',
  },
  redis: {
    port: +process.env.REDIS_PORT! || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    isEnabled: process.env.CACHE_ENABLED === 'true',
  },
  mongo: {
    host: process.env.MONGO_HOST || 'localhost',
    port: +process.env.MONGO_PORT! || 27017,
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DB,
    isEnabled: process.env.MONGO_ENABLED === 'true',
  }
}
