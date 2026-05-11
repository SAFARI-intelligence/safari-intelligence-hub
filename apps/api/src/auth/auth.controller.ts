import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import type { AuthResponse } from "@safari/contracts";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshTokenDto, SignupDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() dto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@CurrentUser() user: RequestUser) {
    await this.authService.logout(user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
