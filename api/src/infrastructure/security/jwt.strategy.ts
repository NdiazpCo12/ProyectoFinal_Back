import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // In a real application, you would fetch the user from the database
    // For now, we'll create a user object from the JWT payload
    return new User(
      payload.sub,
      payload.email,
      '', // password not included in JWT
      payload.role as any,
      new Date(), // createdAt
      new Date(), // updatedAt
    );
  }
}