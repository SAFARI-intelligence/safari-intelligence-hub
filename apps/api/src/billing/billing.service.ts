import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentProvider, SubscriptionTier } from "@prisma/client";
import { AnalyticsService } from "../analytics/analytics.service";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { PrismaService } from "../prisma/prisma.service";
import { QueueService } from "../queue/queue.service";
import Stripe from "stripe";
import { PromoteHotelDto } from "./promote-hotel.dto";
import { UpgradeSubscriptionDto } from "./upgrade-subscription.dto";

@Injectable()
export class BillingService {
  private readonly stripe?: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly analytics: AnalyticsService,
    private readonly queueService: QueueService
  ) {
    const secretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createUpgradeCheckout(user: RequestUser, dto: UpgradeSubscriptionDto) {
    const tier = dto.tier === "partner" ? SubscriptionTier.PARTNER : SubscriptionTier.SAFARI_PLUS;
    const priceId = this.resolvePriceId(tier);

    if (!this.stripe || !priceId) {
      return {
        checkoutUrl: `${dto.successUrl}?mockCheckout=true&tier=${dto.tier}`,
        sessionId: `mock_${Date.now()}`
      };
    }

    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      throw new NotFoundException("User not found.");
    }

    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: { userId: dbUser.id }
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        userId: dbUser.id,
        tier
      }
    });

    return {
      checkoutUrl: session.url ?? dto.successUrl,
      sessionId: session.id
    };
  }

  async handleWebhook(event: { type: string; data?: { object?: unknown } }) {
    if (event.type !== "checkout.session.completed") {
      return { received: true, ignored: true };
    }

    const object = (event.data?.object as Record<string, unknown> | undefined) ?? {};
    const metadata = (object.metadata as Record<string, string> | undefined) ?? {};
    const userId = metadata.userId;
    const tier = metadata.tier;
    if (!userId || !tier) {
      return { received: true, ignored: true };
    }

    const normalizedTier =
      tier === SubscriptionTier.PARTNER || tier === "PARTNER"
        ? SubscriptionTier.PARTNER
        : SubscriptionTier.SAFARI_PLUS;

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: normalizedTier }
    });

    await this.prisma.subscription.create({
      data: {
        userId,
        tier: normalizedTier,
        provider: PaymentProvider.STRIPE,
        status: "active",
        providerRef: String(object.id ?? "")
      }
    });

    await this.analytics.track({
      event: "subscription_conversion",
      distinctId: userId,
      userId,
      properties: {
        tier: normalizedTier
      }
    });

    await this.queueService.enqueueBookingJob({
      type: "subscription-conversion",
      userId,
      tier: normalizedTier,
      createdAt: new Date().toISOString()
    });

    return { received: true };
  }

  parseWebhookEvent(payload: unknown, stripeSignature?: string, rawBody?: Buffer) {
    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    if (this.stripe && webhookSecret && stripeSignature && rawBody) {
      try {
        return this.stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
      } catch {
        throw new BadRequestException("Invalid Stripe webhook signature.");
      }
    }

    if (typeof payload !== "object" || payload === null || !("type" in payload)) {
      throw new BadRequestException("Invalid webhook payload.");
    }

    return payload as { type: string; data?: { object?: unknown } };
  }

  async promoteHotel(hotelId: string, user: RequestUser, dto: PromoteHotelDto) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      throw new NotFoundException("Hotel not found.");
    }

    const endsAt = new Date(dto.endsAt);

    await this.prisma.hotelPromotion.create({
      data: {
        hotelId,
        partnerUserId: user.id,
        startsAt: new Date(dto.startsAt),
        endsAt,
        amountPaid: dto.amountPaid,
        currency: dto.currency ?? "USD"
      }
    });

    await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        promotedUntil: endsAt
      }
    });

    await this.queueService.enqueueBookingJob({
      type: "hotel-promotion",
      hotelId,
      partnerUserId: user.id,
      endsAt: dto.endsAt
    });

    return { success: true };
  }

  async commissionSummary(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: since }
      }
    });

    const grossCommission = bookings.reduce((sum, booking) => sum + booking.commissionAmount.toNumber(), 0);
    return {
      windowDays: days,
      bookings: bookings.length,
      grossCommission
    };
  }

  private resolvePriceId(tier: SubscriptionTier): string | undefined {
    if (tier === SubscriptionTier.PARTNER) {
      return this.configService.get<string>("STRIPE_PRICE_PARTNER");
    }
    return this.configService.get<string>("STRIPE_PRICE_SAFARI_PLUS");
  }
}
