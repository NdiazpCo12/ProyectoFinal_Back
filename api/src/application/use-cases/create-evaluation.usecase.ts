import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Evaluation, EvaluationStatus } from '../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../domain/interfaces/ievaluation.repo';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateEvaluationDto {
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  maxAttempts?: number | null;
  challengeIds: string[];
  courseIds: string[];
}

export interface CreateEvaluationResponse {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  maxAttempts: number | null;
  status: string;
  createdAt: Date;
}

@Injectable()
export class CreateEvaluationUseCase {
  constructor(
    @Inject('IEvaluationRepository')
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateEvaluationDto): Promise<CreateEvaluationResponse> {
    const { name, startDate, endDate, duration, maxAttempts, challengeIds, courseIds } = dto;

    if (startDate >= endDate) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (duration <= 0) {
      throw new BadRequestException('La duración debe ser mayor a 0');
    }

    if (challengeIds.length === 0) {
      throw new BadRequestException('Debe incluir al menos un reto');
    }

    if (courseIds.length === 0) {
      throw new BadRequestException('Debe asignar la evaluación a al menos un curso');
    }

    for (const challengeId of challengeIds) {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
      });
      if (!challenge) {
        throw new NotFoundException(`Reto con ID ${challengeId} no encontrado`);
      }
    }

    for (const courseId of courseIds) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
      }
    }

    const evaluation = Evaluation.create(name, startDate, endDate, duration, maxAttempts ?? null);
    const savedEvaluation = await this.evaluationRepository.create(
      evaluation,
      challengeIds,
      courseIds,
    );

    return {
      id: savedEvaluation.id,
      name: savedEvaluation.name,
      startDate: savedEvaluation.startDate,
      endDate: savedEvaluation.endDate,
      duration: savedEvaluation.duration,
      maxAttempts: savedEvaluation.maxAttempts,
      status: savedEvaluation.status,
      createdAt: savedEvaluation.createdAt,
    };
  }
}



