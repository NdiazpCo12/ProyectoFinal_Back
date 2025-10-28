import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';

// Casos de uso
import { CreateChallengeUseCase } from '../../application/use-cases/create-challenge.usecase';
import { GetChallengesUseCase } from '../../application/use-cases/get-challenges.usecase';
import { UpdateChallengeUseCase } from '../../application/use-cases/update-challenge.usecase';
import { DeleteChallengeUseCase } from '../../application/use-cases/delete-challenge.usecase';

// Repositorios concretos
import { ChallengeRepository } from '../../infrastructure/database/challenge.repository';
import { TestCaseRepository } from '../../infrastructure/database/testcase.repository';

// Prisma
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [ChallengesController],
  providers: [
    // Casos de uso
    CreateChallengeUseCase,
    GetChallengesUseCase,
    UpdateChallengeUseCase,
    DeleteChallengeUseCase,

    // Inyección explícita de interfaces → implementaciones
    {
      provide: 'IChallengeRepository',
      useClass: ChallengeRepository,
    },
    {
      provide: 'ITestCaseRepository',
      useClass: TestCaseRepository,
    },

    // Servicio de Prisma
    PrismaService,
  ],
})
export class ChallengesModule {}

