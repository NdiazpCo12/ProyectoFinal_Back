import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { CreateEvaluationUseCase } from '../../application/use-cases/create-evaluation.usecase';
import { GetEvaluationsUseCase } from '../../application/use-cases/get-evaluations.usecase';
import { GetEvaluationDetailsUseCase } from '../../application/use-cases/get-evaluation-details.usecase';
import { GetEvaluationResultsUseCase } from '../../application/use-cases/get-evaluation-results.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { CreateEvaluationDto } from '../dto/create-evaluation.dto';

@Controller('evaluations')
export class EvaluationsController {
  constructor(
    @Inject(CreateEvaluationUseCase)
    private readonly createEvaluationUseCase: CreateEvaluationUseCase,

    @Inject(GetEvaluationsUseCase)
    private readonly getEvaluationsUseCase: GetEvaluationsUseCase,

    @Inject(GetEvaluationDetailsUseCase)
    private readonly getEvaluationDetailsUseCase: GetEvaluationDetailsUseCase,

    @Inject(GetEvaluationResultsUseCase)
    private readonly getEvaluationResultsUseCase: GetEvaluationResultsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getEvaluations(
    @Request() req: any,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
  ) {
    return this.getEvaluationsUseCase.execute({
      userId: req.user.id,
      role: req.user.role,
      courseId,
      status,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getEvaluationDetails(@Param('id') evaluationId: string, @Request() req: any) {
    return this.getEvaluationDetailsUseCase.execute({
      evaluationId,
      userId: req.user.id,
      role: req.user.role,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id/results')
  async getEvaluationResults(@Param('id') evaluationId: string, @Request() req: any) {
    return this.getEvaluationResultsUseCase.execute({
      evaluationId,
      userId: req.user.id,
      role: req.user.role,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createEvaluation(@Body(ValidationPipe) createDto: CreateEvaluationDto) {
    return this.createEvaluationUseCase.execute(createDto);
  }
}



