import { Body, Controller, Post, TooManyRequestsException, UseGuards } from "@nestjs/common";
import type { AiChatResponse } from "@safari/contracts";
import { CacheService } from "../cache/cache.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { AiChatDto } from "./ai-chat.dto";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly cacheService: CacheService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post("chat")
  async chat(@CurrentUser() user: RequestUser, @Body() dto: AiChatDto): Promise<AiChatResponse> {
    const minuteBucket = Math.floor(Date.now() / 60000);
    const rateKey = `rate:ai:${user.id}:${minuteBucket}`;
    const current = Number((await this.cacheService.get(rateKey)) ?? 0);
    const limitPerMinute = user.subscriptionTier === "safari_plus" || user.subscriptionTier === "partner" ? 40 : 20;
    if (current >= limitPerMinute) {
      throw new TooManyRequestsException("AI request limit reached. Please retry shortly.");
    }
    await this.cacheService.set(rateKey, String(current + 1), 70);
    return this.aiService.chat(user, dto);
  }
}
