import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';

// Casos de uso (application layer)
import { CreateSubmissionUseCase } from '../../application/use-cases/create-submission.usecase';
import { GetSubmissionUseCase } from '../../application/use-cases/get-submission-status.usecase';

// Infraestructura (repositories, redis)
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { JobQueueAdapter } from '../../infrastructure/redis/jobqueue.adapter';

@Module({
  imports: [RedisModule],
  controllers: [SubmissionsController],
  providers: [
    // Casos de uso
    CreateSubmissionUseCase,
    GetSubmissionUseCase,

    // Infraestructura
    SubmissionRepository,
    PrismaService,
    JobQueueAdapter,
  ],
})
export class SubmissionsModule {}
