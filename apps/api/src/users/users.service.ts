import { Injectable, NotFoundException } from "@nestjs/common";
import { SubscriptionTier, UserRole } from "@prisma/client";
import type { UserProfile } from "@safari/contracts";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return this.mapProfile(user);
  }

  async updateSubscriptionTier(userId: string, tier: SubscriptionTier): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier }
    });
    return this.mapProfile(user);
  }

  private mapProfile(user: {
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
      role: user.role === UserRole.ADMIN ? "admin" : user.role === UserRole.PARTNER ? "partner" : "tourist",
      subscriptionTier:
        user.subscriptionTier === SubscriptionTier.SAFARI_PLUS
          ? "safari_plus"
          : user.subscriptionTier === SubscriptionTier.PARTNER
            ? "partner"
            : "free",
      preferences: user.preferences as UserProfile["preferences"],
      homeLocationId: user.homeLocationId,
      createdAt: user.createdAt.toISOString()
    };
  }
}
