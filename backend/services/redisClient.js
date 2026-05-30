const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || null;

let redis = null;
let enabled = false;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on('connect', () => { enabled = true; console.log('✅ Redis connected'); });
  redis.on('error', (err) => { console.warn('⚠️ Redis error (rate limiting degraded):', err.message); });
  redis.on('close', () => { enabled = false; });
} else {
  console.log('ℹ️  REDIS_URL not set — rate limiting will use in-memory fallback.');
}

const rateLimiter = async (key, max, windowMs) => {
  if (!enabled || !redis) return { allowed: true, remaining: max };

  try {
    const now = Date.now();
    const windowKey = Math.floor(now / windowMs);
    const redisKey = `rl:${key}:${windowKey}`;
    const current = await redis.incr(redisKey);
    if (current === 1) await redis.pexpire(redisKey, windowMs);
    const ttl = await redis.pttl(redisKey);
    return {
      allowed: current <= max,
      remaining: Math.max(0, max - current),
      resetIn: ttl > 0 ? ttl : windowMs,
    };
  } catch {
    return { allowed: true, remaining: max };
  }
};

module.exports = { redis, rateLimiter, enabled };
