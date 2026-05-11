import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { SubscriptionTier, UserRole } from "@prisma/client";
import type { AuthResponse, UserProfile } from "@safari/contracts";
import { compare, hash } from "bcryptjs";
import { AnalyticsService } from "../analytics/analytics.service";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RefreshTokenDto, SignupDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already in use.");
    }

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        role: UserRole.TOURIST,
        subscriptionTier: SubscriptionTier.FREE,
        preferences: dto.preferences
      }
    });

    const tokens = await this.createTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.subscriptionTier,
      user.preferences
    );
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
    await this.analyticsService.track({
      event: "signup",
      distinctId: user.id,
      userId: user.id
    });

    return {
      tokens,
      user: this.toUserProfile(user)
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const tokens = await this.createTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.subscriptionTier,
      user.preferences
    );
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: this.toUserProfile(user)
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Refresh token is invalid.");
    }

    const matches = await compare(dto.refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException("Refresh token is invalid.");
    }

    const tokens = await this.createTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.subscriptionTier,
      user.preferences
    );
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: this.toUserProfile(user)
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null }
    });
  }

  private async createTokens(
    userId: string,
    email: string,
    name: string,
    role: UserRole,
    subscriptionTier: SubscriptionTier,
    preferences: string[]
  ) {
    const basePayload = {
      sub: userId,
      email,
      name,
      role: this.mapRole(role),
      subscriptionTier: this.mapTier(subscriptionTier),
      preferences
    };

    const accessToken = await this.jwtService.signAsync(basePayload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN") ?? "15m"
    });

    const refreshToken = await this.jwtService.signAsync(basePayload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d"
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = await hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash }
    });
  }

  private async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET")
      });
    } catch {
      throw new UnauthorizedException("Refresh token is invalid.");
    }
  }

  private toUserProfile(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    subscriptionTier: SubscriptionTier;
    preferences: string[];
    homeLocationId: string | null;
    createdAt: Date;
  }): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: this.mapRole(user.role),
      subscriptionTier: this.mapTier(user.subscriptionTier),
      preferences: user.preferences as UserProfile["preferences"],
      homeLocationId: user.homeLocationId,
      createdAt: user.createdAt.toISOString()
    };
  }

  private mapRole(role: UserRole): UserProfile["role"] {
    if (role === UserRole.ADMIN) return "admin";
    if (role === UserRole.PARTNER) return "partner";
    return "tourist";
  }

  private mapTier(tier: SubscriptionTier): UserProfile["subscriptionTier"] {
    if (tier === SubscriptionTier.SAFARI_PLUS) return "safari_plus";
    if (tier === SubscriptionTier.PARTNER) return "partner";
    return "free";
  }
}
