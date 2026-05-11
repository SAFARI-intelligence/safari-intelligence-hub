import { Module } from "@nestjs/common";
import { AnalyticsModule } from "../analytics/analytics.module";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";

@Module({
  imports: [AnalyticsModule],
  controllers: [MapController],
  providers: [MapService]
})
export class MapModule {}
