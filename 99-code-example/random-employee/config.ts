export default {
  system: {
    delayStartup: process.env.DELAY_STARTUP || '0',
  },
  http: {
    port: process.env.PORT || '3000',
  },
  downwardAPI: {
    podIP: process.env.POD_IP || '',
    memoryLimit: process.env.MEMORY_LIMIT || '',
  }
}
