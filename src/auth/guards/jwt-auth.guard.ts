import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { instanceToInstance } from 'class-transformer';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {

      if (err || !user) {
        throw new UnauthorizedException('Invalid or expired session');
      }
  
      return instanceToInstance(user);
    }
  }