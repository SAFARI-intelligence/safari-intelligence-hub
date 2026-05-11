import { Controller, ForbiddenException, Get, Query, UseGuards } from "@nestjs/common";
import type { NearbyResponse, RouteSuggestion } from "@safari/contracts";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { MapService } from "./map.service";
import { NearbyQueryDto } from "./nearby-query.dto";

@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get("nearby")
  getNearby(@Query() query: NearbyQueryDto): Promise<NearbyResponse> {
    return this.mapService.getNearby(query);
  }

  @Get("routes/suggestions")
  getRouteSuggestions(@Query("limit") limit?: string): Promise<RouteSuggestion[]> {
    return this.mapService.getRouteSuggestions(Number(limit ?? 5));
  }

  @UseGuards(JwtAuthGuard)
  @Get("offline-packs")
  getOfflinePacks(@CurrentUser() user: RequestUser) {
    if (user.subscriptionTier === "free") {
      throw new ForbiddenException("Offline map packs require Safari+ or Partner subscription.");
    }
    return this.mapService.getOfflinePacks();
  }
}
