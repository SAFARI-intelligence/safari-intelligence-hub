import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { SubscriptionTier, UserRole } from "@safari/contracts";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { RequestUser } from "../common/interfaces/request-user.interface";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  preferences?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      subscriptionTier: payload.subscriptionTier,
      preferences: payload.preferences ?? []
    };
  }
}
