// src/config/app.config.ts
import dotenv from "dotenv";
dotenv.config();


export const AppConfig = {
  port: parseInt(process.env.PORT ?? "3000"),

  jwt: {
    secret: process.env.JWT_SECRET ?? "fallback-secret",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"), // 15 phút
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100"),
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL ?? "600"),      // 10 phút
    checkPeriod: 120,
  },

  upload: {
    dest: "uploads/",
    maxSizeMb: 50,
  },

  queue: {
    attempts: 3,
    backoffDelay: 5000,
  },

  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
  },
};