import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';
import { JobQueueAdapter } from '../../infrastructure/redis/jobqueue.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';

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
