import { Controller, Post, Get, Body, Param, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { CreateSubmissionUseCase } from '../../application/use-cases/create-submission.usecase';
import { GetSubmissionUseCase } from '../../application/use-cases/get-submission-status.usecase';
import { GetUserSubmissionsUseCase } from '../../application/use-cases/get-user-submissions.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
    private readonly getUserSubmissionsUseCase: GetUserSubmissionsUseCase,
  ) {}

  // Obtener todas las submissions del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserSubmissions(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.getUserSubmissionsUseCase.execute(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body(ValidationPipe) body: any) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      throw new Error(`User not authenticated. User object: ${JSON.stringify(req.user)}`);
    }
    return this.createSubmissionUseCase.execute({
      ...body,
      userId,
      role,
    });
  }

  // Obtener el estado de un submission por su ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getSubmissionUseCase.execute(id);
  }
}
