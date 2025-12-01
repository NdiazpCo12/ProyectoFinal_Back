import { Injectable, Inject } from '@nestjs/common';
import type {
  GenerateChallengeRequest,
  GenerateChallengeResponse,
} from '../../domain/interfaces/iai-assistant.service';

@Injectable()
export class GenerateAiChallengeUseCase {
  constructor(
    @Inject('IAiAssistantService')
    private readonly aiAssistantService: any,
  ) {}

  async execute(request: GenerateChallengeRequest): Promise<GenerateChallengeResponse> {
    if (!request.theme || request.theme.trim().length === 0) {
      throw new Error('El tema es requerido');
    }

    return await this.aiAssistantService.generateChallenge({
      theme: request.theme.trim(),
    });
  }
}

