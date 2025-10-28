export enum SubmissionStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  ACCEPTED = 'ACCEPTED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
}

export class Submission {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly challengeId: string,
    public readonly language: string,
    public readonly code: string,
    public status: SubmissionStatus = SubmissionStatus.QUEUED,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(userId: string, challengeId: string, language: string, code: string) {
    return new Submission(
      crypto.randomUUID(),
      userId,
      challengeId,
      language,
      code,
      SubmissionStatus.QUEUED,
    );
  }
}
