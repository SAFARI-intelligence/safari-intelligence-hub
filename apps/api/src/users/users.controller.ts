import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.id);
  }
}
