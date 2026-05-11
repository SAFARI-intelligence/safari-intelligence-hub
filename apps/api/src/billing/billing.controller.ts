import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { BillingService } from "./billing.service";
import { PromoteHotelDto } from "./promote-hotel.dto";
import { UpgradeSubscriptionDto } from "./upgrade-subscription.dto";

@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post("upgrade")
  upgrade(@CurrentUser() user: RequestUser, @Body() dto: UpgradeSubscriptionDto) {
    return this.billingService.createUpgradeCheckout(user, dto);
  }

  @Post("webhook")
  webhook(
    @Body() payload: unknown,
    @Headers("stripe-signature") stripeSignature?: string,
    @Req() req?: { rawBody?: Buffer }
  ) {
    const event = this.billingService.parseWebhookEvent(payload, stripeSignature, req?.rawBody);
    return this.billingService.handleWebhook(event);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("partner", "admin")
  @Post("hotels/:hotelId/promote")
  promoteHotel(
    @Param("hotelId") hotelId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: PromoteHotelDto
  ) {
    return this.billingService.promoteHotel(hotelId, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("admin")
  @Get("commissions")
  commissionSummary(@Query("days") days?: string) {
    return this.billingService.commissionSummary(Number(days ?? 30));
  }
}
