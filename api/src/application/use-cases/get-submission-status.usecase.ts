import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';

@Injectable()
export class GetSubmissionUseCase {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async execute(id: string) {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }
}
