import { globalMemoryCache } from "./memoryCache.js";

let redisClient = null;
let redisReady = false;

const initRedis = async () => {
  if (redisClient || !process.env.REDIS_URL) return;
  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    await redisClient.connect();
    redisReady = true;
  } catch {
    redisClient = null;
    redisReady = false;
  }
};

void initRedis();

export const tieredCache = {
  async get(key) {
    const mem = globalMemoryCache.get(key);
    if (mem !== undefined) return mem;
    if (!redisReady || !redisClient) return undefined;
    try {
      const raw = await redisClient.get(key);
      if (raw == null) return undefined;
      const parsed = JSON.parse(raw);
      globalMemoryCache.set(key, parsed.value, parsed.ttlMs ?? 60_000);
      return parsed.value;
    } catch {
      return undefined;
    }
  },

  async set(key, value, ttlMs = 60_000) {
    globalMemoryCache.set(key, value, ttlMs);
    if (!redisReady || !redisClient) return;
    try {
      await redisClient.set(key, JSON.stringify({ value, ttlMs }), "PX", ttlMs);
    } catch {
      /* memory-only fallback */
    }
  },

  async delete(key) {
    globalMemoryCache.delete(key);
    if (redisReady && redisClient) {
      try {
        await redisClient.del(key);
      } catch {
        /* ignore */
      }
    }
  },

  async invalidatePrefix(prefix) {
    globalMemoryCache.invalidatePrefix(prefix);
    if (!redisReady || !redisClient) return;
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length) await redisClient.del(...keys);
    } catch {
      /* ignore */
    }
  },
};
