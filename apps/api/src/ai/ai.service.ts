import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiChatResponse } from "@safari/contracts";
import OpenAI from "openai";
import { AnalyticsService } from "../analytics/analytics.service";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { PrismaService } from "../prisma/prisma.service";
import { QueueService } from "../queue/queue.service";
import { AiChatDto } from "./ai-chat.dto";

interface RetrievalContext {
  animals: Array<{ name: string; species: string; zone: string }>;
  hotels: Array<{ name: string; zone: string; priceFrom: number; rating: number }>;
  routes: Array<{ name: string; estimatedHours: number; tags: string[] }>;
  selectedDestinations: string[];
}

@Injectable()
export class AiService {
  private readonly client?: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly queueService: QueueService
  ) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
    this.model = this.configService.get<string>("OPENAI_MODEL") ?? "gpt-5.2";
  }

  async chat(user: RequestUser, dto: AiChatDto): Promise<AiChatResponse> {
    const conversation = await this.getOrCreateConversation(user.id, dto.conversationId);
    const context = await this.fetchRetrievalContext(dto);
    const memory = await this.prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    const contextSnapshot = {
      userLocation: dto.lat !== undefined && dto.lng !== undefined ? { lat: dto.lat, lng: dto.lng } : null,
      selectedDestinationIds: dto.selectedDestinationIds ?? [],
      hotelPreferences: dto.hotelPreferences ?? [],
      retrieval: context
    };

    await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: dto.message,
        contextSnapshot
      }
    });

    const prompt = this.buildPrompt(user, dto, context, memory);
    const fallback = this.fallbackResponse(context, conversation.id);
    let reply = fallback.reply;

    if (this.client) {
      try {
        const response = await this.client.responses.create({
          model: this.model,
          input: prompt
        });
        if (response.output_text?.trim()) {
          reply = response.output_text.trim();
        }
      } catch {
        reply = fallback.reply;
      }
    }

    await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: reply,
        contextSnapshot
      }
    });

    await this.analytics.track({
      event: "ai_chat",
      distinctId: user.id,
      userId: user.id,
      properties: {
        conversationId: conversation.id,
        messageLength: dto.message.length
      }
    });

    await this.queueService.enqueueAiResponseJob({
      conversationId: conversation.id,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    return {
      reply,
      suggestions: fallback.suggestions,
      conversationId: conversation.id
    };
  }

  private async getOrCreateConversation(userId: string, conversationId?: string) {
    if (conversationId) {
      const existing = await this.prisma.chatConversation.findFirst({
        where: {
          id: conversationId,
          userId
        }
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.chatConversation.create({
      data: {
        userId,
        title: "Safari Concierge Session"
      }
    });
  }

  private async fetchRetrievalContext(dto: AiChatDto): Promise<RetrievalContext> {
    const animals = await this.prisma.animal.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { location: true }
    });

    const hotels = await this.prisma.hotel.findMany({
      take: 5,
      orderBy: [{ featured: "desc" }, { rating: "desc" }]
    });

    const routes = await this.prisma.routeTemplate.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" }
    });

    const nearbyHotels =
      dto.lat !== undefined && dto.lng !== undefined
        ? await this.prisma.$queryRaw<
            Array<{ name: string; zone_name: string; price_from: number; rating: number; distance_km: number }>
          >`
            SELECT h.name, h."zoneName" as zone_name, h."priceFrom"::double precision as price_from, h.rating,
              ST_DistanceSphere(
                COALESCE(l."geoPoint", ST_SetSRID(ST_MakePoint(l.longitude::double precision, l.latitude::double precision), 4326)),
                ST_SetSRID(ST_MakePoint(${dto.lng}, ${dto.lat}), 4326)
              ) / 1000.0 as distance_km
            FROM "Hotel" h
            JOIN "Location" l ON l.id = h."locationId"
            ORDER BY distance_km ASC
            LIMIT 3
          `
        : [];

    return {
      animals: animals.map((animal) => ({
        name: animal.name,
        species: animal.species,
        zone: animal.location.zoneName
      })),
      hotels: (nearbyHotels.length
        ? nearbyHotels.map((row) => ({
            name: row.name,
            zone: row.zone_name,
            priceFrom: row.price_from,
            rating: row.rating
          }))
        : hotels.map((hotel) => ({
            name: hotel.name,
            zone: hotel.zoneName,
            priceFrom: hotel.priceFrom.toNumber(),
            rating: hotel.rating
          }))) as RetrievalContext["hotels"],
      routes: routes.map((route) => ({
        name: route.name,
        estimatedHours: route.estimatedHours,
        tags: route.tags
      })),
      selectedDestinations: await this.resolveSelectedDestinations(dto.selectedDestinationIds ?? [])
    };
  }

  private buildPrompt(
    user: RequestUser,
    dto: AiChatDto,
    context: RetrievalContext,
    memory: Array<{ role: string; content: string }>
  ): string {
    const memoryText = memory
      .reverse()
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const tripStatus = (dto.selectedDestinationIds?.length ?? 0) > 0 ? "active-trip-planning" : "discovery";

    const locationText =
      dto.lat !== undefined && dto.lng !== undefined
        ? `Current location: (${dto.lat}, ${dto.lng}).`
        : "Current location unavailable.";

    return [
      "You are SAFARI concierge: ultra-premium, concise, practical, and region-aware.",
      `User role: ${user.role}. Subscription tier: ${user.subscriptionTier}.`,
      `User interests: ${(dto.preferences?.length ? dto.preferences : user.preferences).join(", ") || "none"}.`,
      `Trip status: ${tripStatus}.`,
      locationText,
      `Selected destination IDs: ${(dto.selectedDestinationIds ?? []).join(", ") || "none"}.`,
      `Resolved selected destinations: ${context.selectedDestinations.join(", ") || "none"}.`,
      `Hotel preferences: ${(dto.hotelPreferences ?? []).join(", ") || "none"}.`,
      `Knowledge animals: ${context.animals.map((a) => `${a.name} (${a.species}, ${a.zone})`).join("; ")}`,
      `Knowledge hotels: ${context.hotels.map((h) => `${h.name} (${h.zone}, ${h.priceFrom} USD, ${h.rating} rating)`).join("; ")}`,
      `Knowledge routes: ${context.routes.map((r) => `${r.name} (${r.estimatedHours}h, ${r.tags.join("/")})`).join("; ")}`,
      `Conversation memory:\n${memoryText || "No previous messages."}`,
      `Latest user message: ${dto.message}`,
      "Output: one clear itinerary answer plus 3 bullet recommendations."
    ].join("\n");
  }

  private fallbackResponse(context: RetrievalContext, conversationId: string): AiChatResponse {
    const firstHotel = context.hotels[0];
    const firstAnimal = context.animals[0];
    const firstRoute = context.routes[0];

    const reply = [
      firstAnimal
        ? `Start with ${firstAnimal.name} sightings in ${firstAnimal.zone} during early light.`
        : "Start with an early wildlife window in a high-density zone.",
      firstHotel
        ? `Anchor midday recovery at ${firstHotel.name} (${firstHotel.zone}) for comfort and reset.`
        : "Anchor midday recovery at a premium lodge near your route.",
      firstRoute
        ? `Use route '${firstRoute.name}' as your spine (~${firstRoute.estimatedHours.toFixed(1)} hours).`
        : "Use a park -> lodge -> attraction arc to balance sightings and comfort.",
      `Conversation reference: ${conversationId}.`
    ].join(" ");

    return {
      reply,
      suggestions: [
        "Reserve top lodge inventory at least 14 days ahead in peak season.",
        "Keep one flexible afternoon block for opportunistic wildlife movement.",
        "Download the regional offline map pack before entering low-signal corridors."
      ],
      conversationId
    };
  }

  private async resolveSelectedDestinations(destinationIds: string[]): Promise<string[]> {
    if (destinationIds.length === 0) {
      return [];
    }

    const [hotels, parks, experiences] = await Promise.all([
      this.prisma.hotel.findMany({ where: { id: { in: destinationIds } }, select: { name: true } }),
      this.prisma.park.findMany({ where: { id: { in: destinationIds } }, select: { name: true } }),
      this.prisma.experience.findMany({ where: { id: { in: destinationIds } }, select: { title: true } })
    ]);

    return [
      ...hotels.map((hotel) => hotel.name),
      ...parks.map((park) => park.name),
      ...experiences.map((experience) => experience.title)
    ];
  }
}
