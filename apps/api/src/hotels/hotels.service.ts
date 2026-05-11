import { Injectable, NotFoundException } from "@nestjs/common";
import type { Hotel, PaginatedResult } from "@safari/contracts";
import { AnalyticsService } from "../analytics/analytics.service";
import { PrismaService } from "../prisma/prisma.service";
import { toPaginated } from "../common/pagination";
import { HotelsQueryDto } from "./hotels-query.dto";

@Injectable()
export class HotelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService
  ) {}

  async getAll(query: HotelsQueryDto): Promise<PaginatedResult<Hotel>> {
    const skip = (query.page - 1) * query.limit;
    const where = typeof query.featured === "boolean" ? { featured: query.featured } : {};

    const [hotels, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ promotedUntil: "desc" }, { rating: "desc" }]
      }),
      this.prisma.hotel.count({ where })
    ]);

    return toPaginated(
      hotels.map((hotel) => this.mapHotel(hotel)),
      query.page,
      query.limit,
      total
    );
  }

  async getById(id: string): Promise<Hotel> {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel ${id} not found.`);
    }
    return this.mapHotel(hotel);
  }

  async trackClick(id: string, distinctId: string, userId?: string) {
    await this.analyticsService.track({
      event: "hotel_click",
      distinctId,
      userId,
      properties: { hotelId: id }
    });
  }

  private mapHotel(hotel: {
    id: string;
    name: string;
    description: string;
    locationId: string;
    zoneName: string;
    currency: string;
    priceFrom: { toNumber: () => number };
    rating: number;
    images: string[];
    featured: boolean;
    promotedUntil: Date | null;
  }): Hotel {
    return {
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      locationId: hotel.locationId,
      zoneName: hotel.zoneName,
      currency: hotel.currency,
      priceFrom: hotel.priceFrom.toNumber(),
      rating: hotel.rating,
      images: hotel.images,
      featured: hotel.featured,
      promotedUntil: hotel.promotedUntil?.toISOString() ?? null
    };
  }
}
