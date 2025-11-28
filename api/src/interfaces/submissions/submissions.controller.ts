import { Controller, Post, Get, Body, Param, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { CreateSubmissionUseCase } from '../../application/use-cases/create-submission.usecase';
import { GetSubmissionUseCase } from '../../application/use-cases/get-submission-status.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body(ValidationPipe) body: any) {
    console.log('Request user:', JSON.stringify(req.user, null, 2));
    const userId = req.user?.id;
    console.log('Extracted userId:', userId);
    if (!userId) {
      throw new Error(`User not authenticated. User object: ${JSON.stringify(req.user)}`);
    }
    return this.createSubmissionUseCase.execute({
      ...body,
      userId,
    });
  }

  // Obtener el estado de un submission por su ID
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getSubmissionUseCase.execute(id);
  }
}
