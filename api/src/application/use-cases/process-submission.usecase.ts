import { Injectable, Logger } from '@nestjs/common';
import { SubmissionRepository } from '../../infrastructure/database/submission.repository';

@Injectable()
export class ProcessSubmissionUseCase {
  private readonly logger = new Logger(ProcessSubmissionUseCase.name);

  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async execute(jobData: any) {
    this.logger.log(`Processing submission ${jobData.id} in ${jobData.language}`);

    // Aquí en producción se llama al worker adecuado (Python, Node, C++, Java)
    // Por ahora simulamos el resultado:
    const simulatedResult = {
      cases: [
        { caseId: 1, status: 'OK', timeMs: 45 },
        { caseId: 2, status: 'OK', timeMs: 60 },
      ],
      score: 100,
      timeMsTotal: 105,
    };

    await this.submissionRepository.updateStatus(jobData.id, 'ACCEPTED', simulatedResult);

    return simulatedResult;
  }
}
