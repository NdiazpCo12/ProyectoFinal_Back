import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { CreateChallengeUseCase } from '../../application/use-cases/create-challenge.usecase';
import { GetChallengesUseCase } from '../../application/use-cases/get-challenges.usecase';
import { UpdateChallengeUseCase } from '../../application/use-cases/update-challenge.usecase';
import { DeleteChallengeUseCase } from '../../application/use-cases/delete-challenge.usecase';
import { ChallengeRepository } from '../../infrastructure/database/challenge.repository';
import { TestCaseRepository } from '../../infrastructure/database/testcase.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [ChallengesController],
  providers: [
    CreateChallengeUseCase,
    GetChallengesUseCase,
    UpdateChallengeUseCase,
    DeleteChallengeUseCase,
    ChallengeRepository,
    TestCaseRepository,
    PrismaService,
  ],
})
export class ChallengesModule {}