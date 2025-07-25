const redis = require('redis');

let client;

async function initRedis() {
  client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    password: process.env.REDIS_PASSWORD || undefined
  });

  client.on('error', (err) => {
    // Handle Redis errors silently in production
  });

  await client.connect();
  return client;
}

async function get(key) {
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

async function set(key, value, ttl = 3600) {
  if (!client) return false;
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

async function del(key) {
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

async function flush() {
  if (!client) return false;
  try {
    await client.flushAll();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  initRedis,
  get,
  set,
  del,
  flush,
  client: () => client
};