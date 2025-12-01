import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { GenerateAiChallengeUseCase } from '../../application/use-cases/generate-ai-challenge.usecase';
import { GoogleAiAdapter } from '../../infrastructure/ai/google-ai.adapter';
import { IAiAssistantService } from '../../domain/interfaces/iai-assistant.service';

@Module({
  controllers: [AiAssistantController],
  providers: [
    GenerateAiChallengeUseCase,
    {
      provide: 'IAiAssistantService',
      useClass: GoogleAiAdapter,
    },
  ],
  exports: [GenerateAiChallengeUseCase],
})
export class AiAssistantModule {}

