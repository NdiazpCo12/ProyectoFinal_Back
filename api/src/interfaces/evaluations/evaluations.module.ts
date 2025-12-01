import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';

import { CreateEvaluationUseCase } from '../../application/use-cases/create-evaluation.usecase';
import { GetEvaluationsUseCase } from '../../application/use-cases/get-evaluations.usecase';
import { GetEvaluationDetailsUseCase } from '../../application/use-cases/get-evaluation-details.usecase';
import { GetEvaluationResultsUseCase } from '../../application/use-cases/get-evaluation-results.usecase';

import { EvaluationRepository } from '../../infrastructure/database/evaluation.repository';

import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [EvaluationsController],
  providers: [
    CreateEvaluationUseCase,
    GetEvaluationsUseCase,
    GetEvaluationDetailsUseCase,
    GetEvaluationResultsUseCase,

    {
      provide: 'IEvaluationRepository',
      useClass: EvaluationRepository,
    },

    PrismaService,
  ],
})
export class EvaluationsModule {}



