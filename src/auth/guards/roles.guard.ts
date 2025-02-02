// src/auth/roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // Get allowed roles from the @Roles decorator
      const requiredRoles = this.reflector.get<UserRole[]>(
        ROLES_KEY,
        context.getHandler(),
      );
      if (!requiredRoles) return true; // No roles specified = public route
  
      // Get user from request session thing yk
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) throw new UnauthorizedException('User not authenticated');
      
      return requiredRoles.some((role) => user.role === role);
    }
}