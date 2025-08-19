import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL as string, {
  tls: {}, // Bắt buộc khi dùng rediss://
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});

redis.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

export default redis;
