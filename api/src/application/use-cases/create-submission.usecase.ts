import { Injectable } from '@nestjs/common';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';
import { JobQueueAdapter } from '../../infrastructure/redis/jobqueue.adapter';

export interface CreateSubmissionDto {
  userId: string;
  challengeId: string;
  language: string;
  code: string;
}

@Injectable()
export class CreateSubmissionUseCase {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly jobQueue: JobQueueAdapter,
  ) {}

  async execute(dto: CreateSubmissionDto) {
    const submission = Submission.create(dto.userId, dto.challengeId, dto.language, dto.code);
    const saved = await this.submissionRepository.create(submission);

    await this.jobQueue.enqueue({
      id: saved.id,
      language: dto.language,
      code: dto.code,
      challengeId: dto.challengeId,
      userId: dto.userId,
    });

    return { id: saved.id, status: SubmissionStatus.QUEUED };
  }
}
