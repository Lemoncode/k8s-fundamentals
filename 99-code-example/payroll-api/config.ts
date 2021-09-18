import 'dotenv/config'

export default {
  http: {
    port: process.env.PORT || '3000',
  },
  redis: {
    port: +process.env.REDIS_PORT! || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    isEnabled: process.env.CACHE_ENABLED === 'true'
  }
}
