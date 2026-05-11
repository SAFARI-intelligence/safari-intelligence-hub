import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
@Roles("admin")
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("summary")
  async summary(@Query("days") daysValue = "30") {
    const days = Math.max(1, Math.min(120, Number(daysValue) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [signups, aiChats, mapInteractions, hotelClicks, subscriptionConversions] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { eventName: "signup", createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventName: "ai_chat", createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventName: "map_interaction", createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventName: "hotel_click", createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({
        where: { eventName: "subscription_conversion", createdAt: { gte: since } }
      })
    ]);

    return {
      windowDays: days,
      signups,
      aiChats,
      mapInteractions,
      hotelClicks,
      subscriptionConversions
    };
  }
}
