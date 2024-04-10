//Any time that we want to connect to Redis, we are going to
//look for the host (e.g. url) and port
module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
};