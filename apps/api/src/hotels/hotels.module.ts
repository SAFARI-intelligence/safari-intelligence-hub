import { Module } from "@nestjs/common";
import { AnalyticsModule } from "../analytics/analytics.module";
import { HotelsController } from "./hotels.controller";
import { HotelsService } from "./hotels.service";

@Module({
  imports: [AnalyticsModule],
  controllers: [HotelsController],
  providers: [HotelsService]
})
export class HotelsModule {}
