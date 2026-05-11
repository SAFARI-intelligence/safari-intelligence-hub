import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type { Hotel, PaginatedResult } from "@safari/contracts";
import { HotelsQueryDto } from "./hotels-query.dto";
import { HotelsService } from "./hotels.service";
import { TrackHotelClickDto } from "./track-click.dto";

@Controller("hotels")
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  getHotels(@Query() query: HotelsQueryDto): Promise<PaginatedResult<Hotel>> {
    return this.hotelsService.getAll(query);
  }

  @Get(":id")
  getHotel(@Param("id") id: string): Promise<Hotel> {
    return this.hotelsService.getById(id);
  }

  @Post(":id/click")
  async trackClick(@Param("id") id: string, @Body() body: TrackHotelClickDto) {
    await this.hotelsService.trackClick(id, body.distinctId, body.userId);
    return { success: true };
  }
}
