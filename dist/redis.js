"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
const redis = new ioredis_1.default(process.env.REDIS_URL, {
    tls: {}, // Bắt buộc khi dùng rediss://
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
});
redis.on("error", (err) => {
    console.error("Redis error:", err);
});
exports.default = redis;
//# sourceMappingURL=redis.js.map