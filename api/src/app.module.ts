import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './interfaces/auth/auth.module';
import { ChallengesModule } from './interfaces/challenges/challenges.module';

@Module({
  imports: [AuthModule, ChallengesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
