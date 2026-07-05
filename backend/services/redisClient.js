const Redis = require('ioredis');

let redis = null;
let enabled = false;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) { return Math.min(times * 100, 3000); },
      lazyConnect: true,
    });
    redis.on('error', () => { enabled = false; });
    enabled = true;
  }
} catch (e) {
  enabled = false;
}

async function rateLimiter(key, maxRequests, windowMs) {
  if (!enabled || !redis) {
    return { allowed: true, remaining: maxRequests };
  }
  try {
    const entry = await redis.multi()
      .incr(key)
      .pttl(key)
      .exec();
    const count = entry[0][1];
    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }
    const ttl = entry[1][1];
    return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count), ttl };
  } catch (e) {
    return { allowed: true, remaining: maxRequests };
  }
}

module.exports = { rateLimiter, enabled };
