// src/config/redis.ts
import IORedis from "ioredis";
import logger from "../logger";

export const redisClient = new IORedis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Thử kết nối lại tối đa 3 lần, mỗi lần cách nhau 2 giây
    if (times > 3) {
      logger.error("Redis không kết nối được sau 3 lần thử");
      return null;
    }
    return times * 2000;
  },
});

redisClient.on("connect", () => logger.info("Redis connected!"));
redisClient.on("error", (err) => logger.error("Redis error:", err));

export default redisClient;