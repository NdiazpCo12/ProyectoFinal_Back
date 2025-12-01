// api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos apP
import { AuthModule } from './interfaces/auth/auth.module';
import { ChallengesModule } from './interfaces/challenges/challenges.module';
import { SubmissionsModule } from './interfaces/submissions/submissions.module';
import { CoursesModule } from './interfaces/courses/courses.module';
import { EvaluationsModule } from './interfaces/evaluations/evaluations.module';
import { AiAssistantModule } from './interfaces/ai-assistant/ai-assistant.module';
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

    // JWT compartido (para que JwtService funcione globalmente)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: '24h' },
    }),

    // MODULES principales de la app
    AuthModule,
    ChallengesModule,
    SubmissionsModule,
    CoursesModule,
    EvaluationsModule,
    AiAssistantModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    JwtStrategy, //EstrategY JWT disponible globalmente
  ],
})
export class AppModule {}
