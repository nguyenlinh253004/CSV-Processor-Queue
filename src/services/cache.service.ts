// src/services/cache.service.ts
import redisClient from "../config/redis";
import logger from "../logger";

export class CacheService {
  // Lấy data từ cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn(`Cache get lỗi cho key ${key}:`, err);
      return null; // Cache lỗi thì bỏ qua, không crash app
    }
  }

  // Lưu data vào cache
  async set(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.warn(`Cache set lỗi cho key ${key}:`, err);
    }
  }

  // Xóa 1 key
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn(`Cache del lỗi cho key ${key}:`, err);
    }
  }

  // Xóa nhiều key theo pattern — ví dụ "users_*" xóa hết cache users
  async delByPattern(pattern: string): Promise<void> {
    try {
      // SCAN thay vì KEYS — an toàn hơn trên production vì không block Redis
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redisClient.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redisClient.del(...keys);
          logger.info(`Đã xóa ${keys.length} cache keys theo pattern: ${pattern}`);
        }
      } while (cursor !== "0");
    } catch (err) {
      logger.warn(`Cache delByPattern lỗi cho pattern ${pattern}:`, err);
    }
  }

  // Kiểm tra key có tồn tại không
  async exists(key: string): Promise<boolean> {
    try {
      return (await redisClient.exists(key)) === 1;
    } catch {
      return false;
    }
  }
}

export const cacheService = new CacheService();