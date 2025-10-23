import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BcryptService } from '../../infrastructure/security/bcrypt.service';
import { JwtStrategy } from '../../infrastructure/security/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    UserRepository,
    PrismaService,
    BcryptService,
    JwtStrategy,
  ],
  exports: [JwtStrategy],
})
export class AuthModule {}