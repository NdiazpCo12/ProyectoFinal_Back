import { Inject, Injectable } from '@nestjs/common';
import type { IEvaluationRepository } from '../../domain/interfaces/ievaluation.repo';
import { EvaluationStatus } from '../../domain/entities/evaluation.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface GetEvaluationsDto {
  userId: string;
  role: string;
  courseId?: string;
  status?: string;
}

export interface EvaluationSummary {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  maxAttempts: number | null;
  status: string;
  createdAt: Date;
  challengeCount: number;
  courseCount: number;
}

@Injectable()
export class GetEvaluationsUseCase {
  constructor(
    @Inject('IEvaluationRepository')
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: GetEvaluationsDto): Promise<EvaluationSummary[]> {
    const { userId, role, courseId, status } = dto;

    let evaluations;

    if (role === 'ADMIN') {
      evaluations = await this.evaluationRepository.findEvaluationsByProfessor(userId);
    } else {
      evaluations = await this.evaluationRepository.findEvaluationsByStudent(userId);
    }

    if (status) {
      evaluations = evaluations.filter(evaluation => evaluation.status === status);
    }

    const now = new Date();
    for (const evaluation of evaluations) {
      if (evaluation.status === EvaluationStatus.SCHEDULED && now >= evaluation.startDate) {
        await this.evaluationRepository.update(evaluation.id, {
          status: EvaluationStatus.ACTIVE,
        });
        evaluation.status = EvaluationStatus.ACTIVE;
      }
      if (evaluation.status === EvaluationStatus.ACTIVE && now > evaluation.endDate) {
        await this.evaluationRepository.update(evaluation.id, {
          status: EvaluationStatus.CLOSED,
        });
        evaluation.status = EvaluationStatus.CLOSED;
      }
    }

    const summaries = await Promise.all(
      evaluations.map(async evaluation => {
        const challengeCount = await this.prisma.evaluationChallenge.count({
          where: { evaluationId: evaluation.id },
        });

        const courseCount = await this.prisma.evaluationCourse.count({
          where: { evaluationId: evaluation.id },
        });

        if (courseId) {
          const hasCourse = await this.prisma.evaluationCourse.findFirst({
            where: {
              evaluationId: evaluation.id,
              courseId,
            },
          });
          if (!hasCourse) return null;
        }

        return {
          id: evaluation.id,
          name: evaluation.name,
          startDate: evaluation.startDate,
          endDate: evaluation.endDate,
          duration: evaluation.duration,
          maxAttempts: evaluation.maxAttempts,
          status: evaluation.status,
          createdAt: evaluation.createdAt,
          challengeCount,
          courseCount,
        };
      }),
    );

    return summaries.filter(s => s !== null) as EvaluationSummary[];
  }
}

