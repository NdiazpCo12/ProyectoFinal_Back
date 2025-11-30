import { Injectable, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';
import { JobQueueAdapter } from '../../infrastructure/redis/jobqueue.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EvaluationStatus } from '../../domain/entities/evaluation.entity';

export interface CreateSubmissionDto {
  userId: string;
  challengeId: string;
  language: string;
  code: string;
  role?: string;
}

@Injectable()
export class CreateSubmissionUseCase {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly jobQueue: JobQueueAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateSubmissionDto) {
    const { userId, challengeId, role } = dto;

    if (role === 'STUDENT') {
      const courseChallenge = await this.prisma.courseChallenge.findFirst({
        where: { challengeId },
        include: {
          course: {
            include: {
              enrollments: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!courseChallenge || courseChallenge.course.enrollments.length === 0) {
        throw new ForbiddenException('No estás inscrito en un curso que tenga este reto');
      }

      const activeEvaluation = await this.prisma.evaluation.findFirst({
        where: {
          challenges: {
            some: { challengeId },
          },
          status: EvaluationStatus.ACTIVE,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          courses: {
            some: {
              courseId: courseChallenge.courseId,
            },
          },
        },
      });

      if (activeEvaluation) {
        if (new Date() > activeEvaluation.endDate) {
          throw new ForbiddenException('La evaluación ha finalizado');
        }

        if (activeEvaluation.maxAttempts !== null) {
          const attemptCount = await this.prisma.submission.count({
            where: {
              userId,
              challengeId,
              evaluationId: activeEvaluation.id,
            },
          });

          if (attemptCount >= activeEvaluation.maxAttempts) {
            throw new BadRequestException(
              `Has alcanzado el límite de intentos (${activeEvaluation.maxAttempts}) para este reto`,
            );
          }
        }

        const submission = Submission.create(
          userId,
          challengeId,
          dto.language,
          dto.code,
          activeEvaluation.id,
        );
        const saved = await this.submissionRepository.create(submission);

        await this.jobQueue.enqueue({
          id: saved.id,
          language: dto.language,
          code: dto.code,
          challengeId: challengeId,
          userId: userId,
        });

        return { id: saved.id, status: SubmissionStatus.QUEUED };
      }
    }

    const submission = Submission.create(userId, challengeId, dto.language, dto.code);
    const saved = await this.submissionRepository.create(submission);

    await this.jobQueue.enqueue({
      id: saved.id,
      language: dto.language,
      code: dto.code,
      challengeId: challengeId,
      userId: userId,
    });

    return { id: saved.id, status: SubmissionStatus.QUEUED };
  }
}
