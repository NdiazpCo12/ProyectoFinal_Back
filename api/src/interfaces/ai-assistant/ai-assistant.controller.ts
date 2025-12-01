import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { GenerateAiChallengeUseCase } from '../../application/use-cases/generate-ai-challenge.usecase';
import { GenerateAiChallengeDto } from '../dto/generate-ai-challenge.dto';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(
    private readonly generateAiChallengeUseCase: GenerateAiChallengeUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('generate')
  async generateChallenge(
    @Body(ValidationPipe) dto: GenerateAiChallengeDto,
  ) {
    return await this.generateAiChallengeUseCase.execute({
      theme: dto.theme,
    });
  }
}

