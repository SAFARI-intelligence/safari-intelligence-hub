import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@safari/contracts";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { RequestUser } from "../interfaces/request-user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const role = request.user?.role;
    if (!role) {
      return true;
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException("Insufficient permissions for this action.");
    }

    return true;
  }
}
