// api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos de tu aplicación
import { AuthModule } from './interfaces/auth/auth.module';
import { ChallengesModule } from './interfaces/challenges/challenges.module';
import { SubmissionsModule } from './interfaces/submissions/submissions.module';
import { RedisModule } from './infrastructure/redis/redis.module';

// Servicios e infraestructura
import { PrismaService } from './infrastructure/database/prisma.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Módulo JWT compartido (para que JwtService funcione globalmente)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: '24h' },
    }),

    // Módulos principales de la app
    AuthModule,
    ChallengesModule,
    SubmissionsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    JwtStrategy, // ✅ Estrategia JWT disponible globalmente
  ],
})
export class AppModule {}
