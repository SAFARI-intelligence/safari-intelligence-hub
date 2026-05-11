import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import Redis from "ioredis";

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly redisConnection?: Redis;
  private readonly aiQueue?: Queue;
  private readonly bookingQueue?: Queue;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>("REDIS_URL");
    if (redisUrl) {
      this.redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });
      this.aiQueue = new Queue("ai-jobs", { connection: this.redisConnection });
      this.bookingQueue = new Queue("booking-jobs", { connection: this.redisConnection });
    }
  }

  async enqueueAiResponseJob(payload: Record<string, unknown>) {
    if (!this.aiQueue) {
      return;
    }
    await this.aiQueue.add("ai-response", payload, {
      removeOnComplete: 50,
      removeOnFail: 100
    });
  }

  async enqueueBookingJob(payload: Record<string, unknown>) {
    if (!this.bookingQueue) {
      return;
    }
    await this.bookingQueue.add("booking-sync", payload, {
      removeOnComplete: 50,
      removeOnFail: 100
    });
  }

  async onModuleDestroy() {
    await Promise.all([this.aiQueue?.close(), this.bookingQueue?.close()]);
    if (this.redisConnection) {
      await this.redisConnection.quit();
    }
  }
}
