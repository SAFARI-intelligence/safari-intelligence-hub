import { Module } from "@nestjs/common";
import { AnalyticsModule } from "../analytics/analytics.module";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [AnalyticsModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService]
})
export class BillingModule {}
