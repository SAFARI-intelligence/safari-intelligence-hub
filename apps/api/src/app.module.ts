import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AiModule } from "./ai/ai.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AnimalsModule } from "./animals/animals.module";
import { AuthModule } from "./auth/auth.module";
import { BillingModule } from "./billing/billing.module";
import { CacheModule } from "./cache/cache.module";
import { HotelsModule } from "./hotels/hotels.module";
import { MapModule } from "./map/map.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QueueModule } from "./queue/queue.module";
import { StoriesModule } from "./stories/stories.module";
import { SystemModule } from "./system/system.module";
import { UsersModule } from "./users/users.module";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (input) => validateServerEnv(input as Record<string, string | undefined>)
    }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 120
      }
    ]),
    PrismaModule,
    CacheModule,
    QueueModule,
    AuthModule,
    UsersModule,
    AnimalsModule,
    StoriesModule,
    HotelsModule,
    MapModule,
    AiModule,
    BillingModule,
    AnalyticsModule,
    SystemModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}

function validateServerEnv(source: Record<string, string | undefined>) {
  const required = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
  for (const key of required) {
    if (!source[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    ...source,
    PORT: source.PORT ? Number(source.PORT) : 4000
  };
}
