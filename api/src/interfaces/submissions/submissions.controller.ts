import { Controller, Post, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { CreateSubmissionUseCase } from '../../application/use-cases/create-submission.usecase';
import { GetSubmissionUseCase } from '../../application/use-cases/get-submission-status.usecase';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
  ) {}

  // Crear un nuevo submission (envío de código)
  @Post()
  async create(@Body(ValidationPipe) body: any) {
    return this.createSubmissionUseCase.execute(body);
  }

  // Obtener el estado de un submission por su ID
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getSubmissionUseCase.execute(id);
  }
}
