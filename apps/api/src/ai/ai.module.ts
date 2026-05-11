import { Module } from "@nestjs/common";
import { AnalyticsModule } from "../analytics/analytics.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [AnalyticsModule],
  controllers: [AiController],
  providers: [AiService]
})
export class AiModule {}
