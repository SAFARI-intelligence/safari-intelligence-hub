import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostHog } from "posthog-node";
import { PrismaService } from "../prisma/prisma.service";

interface TrackEventPayload {
  event: string;
  distinctId: string;
  userId?: string;
  properties?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly client?: PostHog;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>("POSTHOG_API_KEY");
    if (apiKey) {
      this.client = new PostHog(apiKey, {
        host: this.configService.get<string>("POSTHOG_HOST") ?? "https://app.posthog.com"
      });
    }
  }

  async track(payload: TrackEventPayload) {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          eventName: payload.event,
          distinctId: payload.distinctId,
          userId: payload.userId,
          properties: payload.properties
        }
      });
    } catch (error) {
      this.logger.warn(`Failed to persist analytics event ${payload.event}: ${String(error)}`);
    }

    if (this.client) {
      try {
        this.client.capture({
          distinctId: payload.distinctId,
          event: payload.event,
          properties: payload.properties
        });
      } catch (error) {
        this.logger.warn(`Failed to publish PostHog event ${payload.event}: ${String(error)}`);
      }
    }
  }

  async flush() {
    if (!this.client) {
      return;
    }
    try {
      await this.client.shutdownAsync();
    } catch (error) {
      this.logger.warn(`PostHog flush failed: ${String(error)}`);
    }
  }

  async onModuleDestroy() {
    await this.flush();
  }
}
