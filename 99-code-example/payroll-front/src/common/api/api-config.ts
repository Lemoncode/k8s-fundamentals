export default {
    host: process.env.API_HOST,
    port: process.env.API_PORT,
    isMock: process.env.API_MOCK === 'true',
}
