import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis?: Redis;
  private readonly memoryFallback = new Map<string, string>();

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>("REDIS_URL");
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1
      });
      void this.redis.connect().catch((error) => {
        this.logger.warn(`Redis unavailable, using in-memory cache fallback: ${String(error)}`);
      });
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redis?.status === "ready") {
      return this.redis.get(key);
    }
    return this.memoryFallback.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.redis?.status === "ready") {
      await this.redis.set(key, value, "EX", ttlSeconds);
      return;
    }
    this.memoryFallback.set(key, value);
    setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000).unref();
  }

  async del(key: string): Promise<void> {
    if (this.redis?.status === "ready") {
      await this.redis.del(key);
      return;
    }
    this.memoryFallback.delete(key);
  }
}
