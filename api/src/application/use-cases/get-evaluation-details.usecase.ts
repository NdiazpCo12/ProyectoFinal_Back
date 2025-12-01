import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IEvaluationRepository } from '../../domain/interfaces/ievaluation.repo';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EvaluationStatus } from '../../domain/entities/evaluation.entity';

export interface GetEvaluationDetailsDto {
  evaluationId: string;
  userId: string;
  role: string;
}

export interface ChallengeInfo {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
}

export interface EvaluationDetailsResponse {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  maxAttempts: number | null;
  status: string;
  challenges: ChallengeInfo[];
  courses: Array<{ id: string; name: string; nrc: string }>;
  canSubmit: boolean;
}

@Injectable()
export class GetEvaluationDetailsUseCase {
  constructor(
    @Inject('IEvaluationRepository')
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: GetEvaluationDetailsDto): Promise<EvaluationDetailsResponse> {
    const { evaluationId, userId, role } = dto;

    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (role === 'STUDENT') {
      const isEnrolled = await this.prisma.courseEnrollment.findFirst({
        where: {
          userId,
          course: {
            evaluationCourses: {
              some: { evaluationId },
            },
          },
        },
      });

      if (!isEnrolled) {
        throw new ForbiddenException('No estás inscrito en un curso con esta evaluación');
      }
    }

    const evaluationData = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        challenges: {
          include: {
            challenge: true,
          },
        },
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!evaluationData) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    const now = new Date();
    let status = evaluation.status;
    if (status === EvaluationStatus.SCHEDULED && now >= evaluation.startDate) {
      status = EvaluationStatus.ACTIVE;
      await this.evaluationRepository.update(evaluationId, { status: EvaluationStatus.ACTIVE });
    }
    if (status === EvaluationStatus.ACTIVE && now > evaluation.endDate) {
      status = EvaluationStatus.CLOSED;
      await this.evaluationRepository.update(evaluationId, { status: EvaluationStatus.CLOSED });
    }

    const canSubmit =
      status === EvaluationStatus.ACTIVE &&
      now >= evaluation.startDate &&
      now <= evaluation.endDate;

    return {
      id: evaluation.id,
      name: evaluation.name,
      startDate: evaluation.startDate,
      endDate: evaluation.endDate,
      duration: evaluation.duration,
      maxAttempts: evaluation.maxAttempts,
      status,
      challenges: evaluationData.challenges.map(ec => ({
        id: ec.challenge.id,
        title: ec.challenge.title,
        description: ec.challenge.description,
        difficulty: ec.challenge.difficulty,
        timeLimit: ec.challenge.timeLimit,
        memoryLimit: ec.challenge.memoryLimit,
      })),
      courses: evaluationData.courses.map(ec => ({
        id: ec.course.id,
        name: ec.course.name,
        nrc: ec.course.nrc,
      })),
      canSubmit,
    };
  }
}



